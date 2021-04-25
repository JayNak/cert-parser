var fsrecurse = require('fs-readdir-recursive');
var fs = require('fs');
var path = require('path');
var os = require('os')
var cp = require('./modules/certParser');
const objsToCsv = require('objects-to-csv');

// Check for command line parameters
if (process.argv.length != 3) {
    // Display the usage info
    console.log("Exactly 2 parameters required...")
    console.log("<sourceFolder>: path to the folder containing certificates to be parsed")
    process.exit(0);
}

// Set the sourceFolder and outputFile variables
const sourceFolder = process.argv[2];

// Validate parameters
if (!fs.existsSync(sourceFolder)) {
    console.log(`Folder ${sourceFolder} does not exist.  Exiting.`);
    process.exit(1);
}

// Generate a filename
const timeStamp = (new Date()).toISOString();
const outputFile = `certificates-${timeStamp}.csv`;
const logFile = `import-log-${timeStamp}.log`

// Create log stream
var logger = fs.createWriteStream(logFile, {flags: 'a' });

var of = path.parse(process.cwd());
fs.accessSync(of.dir, fs.constants.W_OK, (err) => {
    if (err) {
        console.error(`Cannot write to ${outputFile}.  Exiting.`)
        process.exit(1);
    }
});

// Get an absolute path for the source folder
const absPath = path.resolve(sourceFolder);

console.log(`Looking for files in ${absPath}...`)
var files = fsrecurse(absPath);

// Create an array to hold the certs
var certs = [];

files.forEach(file => {
    // Only parse .xls and .xlsx files
    if (['.xls', '.xlsx'].includes(path.extname(file).toLowerCase())) {
        
        try {
            var parsedCerts = cp.parseFile(path.join(absPath, file));
            logger.write(`INFO, ${path.join(absPath, file)}, Found ${parsedCerts.length} certificates.` + os.EOL)
            console.log(`INFO, ${path.join(absPath, file)}, Found ${parsedCerts.length} certificates.`)            

            parsedCerts.forEach((cert) => {
                cert.AA_fileName = file
                certs.push(cert);    
            });
        } catch (err) {
            logger.write(`ERROR, ${path.join(absPath, file)}, ${err}.` + os.EOL)
            console.log(`ERROR, ${path.join(absPath, file)}, ${err}.`)
        }
        
    }
});

// Write out to .csv
console.log('Finished Parsing, now exporting...')
new objsToCsv(certs).toDisk(outputFile, { allColumns: true });

// Close the log file
logger.end();
