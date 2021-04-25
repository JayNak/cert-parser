const XLSX = require('xlsx');
const os = require('os');
const config = require('./mappingConfig');
const csvparse = require('csv-parse/lib/sync')

// Cheater constants
const mappings = config.mainBlock;
const inspectionKeys = config.inspectionKeys;
const workKeys = config.workKeys;

// Utility Functions
keyClean = (input) => { return input.replace(/[^a-zA-Z0-9_-]/g,''); }
valClean = (input) => { return input.replace("\"\"\"", "\""); }

module.exports.parseFile = (fileName) => {

    // Use the XLSX library to parse the .xls file
    var book = XLSX.readFile(fileName)

    // Export the sheet to a csv
    var csv_array = XLSX.utils.sheet_to_csv(book.Sheets.Certificate);
    
    // Create an array to hold objects
    var certs = [];
    var index = 0;

    // Create initial cert
    var cert = {};
    
    // Parse the CSV file using the csv-parse library
    const records = csvparse(csv_array, {
        columns: false,
        skip_empty_lines: true
      })

    records.forEach((cols) => {
    
        // Check for main block variables
        if (mappings.has(cols[0])) {
            cert[mappings.get(cols[0])[0]] = valClean(cols[1]);
            if (mappings.get(cols[0])[1] != '') { cert[mappings.get(cols[0])[1]] = valClean(cols[5]); }
        }
    
        // Inspection Section is a different format
        if (inspectionKeys.includes(cols[0])) {
            cert[`Inspection_${keyClean(cols[0])}`] = valClean(cols[1]);
            cert[`Inspection_${keyClean(cols[3])}`] = valClean(cols[4]);
            cert[`Inspection_${keyClean(cols[5])}`] = valClean(cols[6]);
        }
    
        // Work Performed section is a third format
        if (workKeys.includes(cols[0])) {
            cert[`Work_${keyClean(cols[0])}`] = valClean(cols[1]);
            if (keyClean(cols[3]) != '') { cert[`Work_${keyClean(cols[3])}`] = valClean(cols[4]); }            
            if (keyClean(cols[5]) != '') { cert[`Work_${keyClean(cols[5])}`] = valClean(cols[6]); }
        }
    
        // Pre-Test, Final Testing and cert rotation - this is sloppy
        switch (cols[0]) {
            case 'Leaked @':
                cert.PreTest_LeakedAt = cols[1];
                cert.PreTest_PopAt = cols[5];
                break;
            case 'Notes':
                cert.PreTest_Notes = cols[1];
                break;
            case 'Set Pressure':
                cert.FinalTest_SetPressure = valClean(cols[1]);
                cert.FinalTest_TestGauge = valClean(cols[4]);
                break;
            case 'Test #1':
                cert.FinalTest_Test1 = valClean(cols[1]);
                cert.FinalTest_Bellows = cols[4] == '' ? "No" : `Yes @ ${cols[6]} for ${cols[8]}`;
                break;
            case 'Test #2':
                cert.FinalTest_Test2 = valClean(cols[1]);
                cert.FinalTest_BackPressure = cols[4] == '' ? "No" : `Yes @ ${cols[6]} for ${cols[8]}`;
                break;
            case 'Test #3':
                cert.FinalTest_Test3 = valClean(cols[1]);
                cert.FinalTest_SealTightness = cols[4] == '' ? "No" : `Yes @ ${cols[6]} for ${cols[8]}`;
                break;
            case 'Average Test:':
                cert.FinalTest_AverageTest = valClean(cols[1]);
                cert.FinalTest_TestMedium = valClean(cols[4]);
                break;
            case 'CERTIFICATION':
                certs[index] = {};

                // HACK - remove duplicate Test Gauge
                delete cert.Work_TestGauge
    
                Object.assign(certs[index], cert);
                cert = {};
                index++;

                break;
        }
    })    

    // Return
    return certs;

}


