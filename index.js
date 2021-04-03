var fsrecurse = require('fs-readdir-recursive');
var path = require('path');
var cp = require('./modules/certParser');
const objsToCsv = require('objects-to-csv');

// TODO: Prompt for folder
const sourceFolder = "./data";
const outputFile = "./parsed/certIndex.csv"

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
        // // Add the filename to the returned object
        // // parsedCert.AA_fileName = file;
        // certs.push(parsedCert);
    }
});

console.log('Finished Parsing, now exporting...')

// Write out to .csv
new objsToCsv(certs).toDisk(outputFile, { allColumns: true });