const fs = require('fs');
const file = 'frontend/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add expectedDate to state
content = content.replace(
  "const [receivedDate, setReceivedDate] = useState(format(new Date(), 'yyyy-MM-dd'))",
  "const [receivedDate, setReceivedDate] = useState(format(new Date(), 'yyyy-MM-dd'))\n  const [expectedDate, setExpectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))"
);

// 2. Update handleEditClick
content = content.replace(
  "setReceivedDate(format(new Date(coll.receivedDate), 'yyyy-MM-dd'))",
  "setReceivedDate(format(new Date(coll.receivedDate), 'yyyy-MM-dd'))\n    setExpectedDate(coll.expectedDate ? format(new Date(coll.expectedDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'))"
);

// 3. Update handleCancelEdit
content = content.replace(
  "setReceivedDate(format(new Date(), 'yyyy-MM-dd'))",
  "setReceivedDate(format(new Date(), 'yyyy-MM-dd'))\n    setExpectedDate(format(new Date(), 'yyyy-MM-dd'))"
);

// 4. Update handleAddCollection payload
content = content.replace(
  /receivedDate,\s*status: isExpected \? 'expected' : 'received'/g,
  "receivedDate,\n          expectedDate: isExpected ? expectedDate : null,\n          status: isExpected ? 'expected' : 'received'"
);

// 5. Update form UI
const oldDateInput = `            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Received Date</label>
              <input required type="date" value={receivedDate} onChange={e => setReceivedDate(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500" />
            </div>`;

const newDateInput = `            {isExpected ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Expected Date</label>
                <input required type="date" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Received Date</label>
                <input required type="date" value={receivedDate} onChange={e => setReceivedDate(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
            )}`;

content = content.replace(oldDateInput, newDateInput);

// 6. Update table
const oldTableDate = `<td className="px-6 py-4 whitespace-nowrap text-slate-600">{format(new Date(coll.receivedDate), 'MMM dd, yyyy')}</td>`;
const newTableDate = `<td className="px-6 py-4 whitespace-nowrap text-slate-600">
                    {coll.status === 'expected' && coll.expectedDate 
                      ? <span className="text-orange-600 font-medium">Exp: {format(new Date(coll.expectedDate), 'MMM dd, yyyy')}</span> 
                      : format(new Date(coll.receivedDate), 'MMM dd, yyyy')}
                  </td>`;

content = content.replace(oldTableDate, newTableDate);

fs.writeFileSync(file, content);
