var fsrecurse = require('fs-readdir-recursive');
var fs = require('fs');
var path = require('path');
var cp = require('./modules/certParser');
const objsToCsv = require('objects-to-csv');

// Check for command line parameters
if (process.argv.length != 4) {
    // Display the usage info
    console.log("Exactly 2 parameters required...")
    console.log("<sourceFolder>: path to the folder containing certificates to be parsed")
    console.log("<outputFile>: .csv filename to write.  Note that this will overwrite an existing file.")
    process.exit(0);
}

// Set the sourceFolder and outputFile variables
const sourceFolder = process.argv[2];
const outputFile = process.argv[3];

// Validate parameters
if (!fs.existsSync(sourceFolder)) {
    console.log(`Folder ${sourceFolder} does not exist.  Exiting.`);
    process.exit(1);
}

var of = path.parse(outputFile);
console.log(of);
fs.accessSync(of.dir, fs.constants.W_OK, (err) => {
    if (err) {
        console.error(`Cannot write to ${outputFile}.  Exiting.`)
        process.exit();
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
        console.log(`Parsing file: ${path.join(absPath, file)}`);
        var parsedCerts = cp.parseFile(path.join(absPath, file));
    
        parsedCerts.forEach((cert) => {
            cert.AA_fileName = file
            certs.push(cert);    
        });
    }
});

console.log('Finished Parsing, now exporting...')

// Write out to .csv
new objsToCsv(certs).toDisk(outputFile, { allColumns: true });