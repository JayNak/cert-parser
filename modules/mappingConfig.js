const mappings = new Map();
mappings.set('Company:', ['Company', 'PONo']);
mappings.set('Address', ['Address', 'WorkOrder']);
mappings.set('Manufacturer:', ['Manufacturer', 'Model']);
mappings.set('CRN No', ['CRNNo', 'SerialNo']);
mappings.set('Inlet Size type and rating', ['Inlet', 'SetPressure']);
mappings.set('Outlet Size type and rating', ['Outlet', 'CDTP']);
mappings.set('Orifice Designation', ['Orifice', 'BackPressure']);
mappings.set('Equipment #', ['EquipNo', 'Capacity']);
mappings.set('Customer ID', ['CustomerID', 'PVCode']);
mappings.set('Service Media', ['ServiceMedia', '']);

module.exports.mainBlock = mappings;
module.exports.inspectionKeys = ['Lifting Lever/Cap', 'Bonnet', 'Body', 'Inlet', 'Outlet', 'Bolting'];
module.exports.workKeys = ['Sandblasting', 'O2 Cleaning', 'Set Pressure', 'New Capacity', 'New Parts Added:'];


