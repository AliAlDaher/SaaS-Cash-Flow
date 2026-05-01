const fs = require('fs');

const file = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix Table Headers in DashboardTab
const dashboardHeadersRegex = /<th className="px-6 py-4 whitespace-nowrap">Due Date<\/th>\s*<th className="px-6 py-4 whitespace-nowrap">Due Status<\/th>\s*<th className="px-6 py-4 whitespace-nowrap text-right">Remaining Amount<\/th>\s*<th className="px-6 py-4 whitespace-nowrap">Status<\/th>/;

content = content.replace(dashboardHeadersRegex, `<th className="px-6 py-4 whitespace-nowrap">Due Date</th>
                  <th className="px-6 py-4 whitespace-nowrap text-right">Remaining Amount</th>
                  <th className="px-6 py-4 whitespace-nowrap">Due Status</th>`);

// If the regex above doesn't match because my previous script was slightly different:
content = content.replace(/<th className="px-6 py-4 whitespace-nowrap">Due Status<\/th>\s*<th className="px-6 py-4 whitespace-nowrap text-right">Remaining Amount<\/th>\s*<th className="px-6 py-4 whitespace-nowrap">Status<\/th>/, `<th className="px-6 py-4 whitespace-nowrap text-right">Remaining Amount</th>
                  <th className="px-6 py-4 whitespace-nowrap">Due Status</th>`);


// 2. Fix Overdue Invoices > 1
content = content.replace(
  /statusLabel: formatOverdueString\(earliestDueDate, today\)/g,
  'statusLabel: "Overdue"'
);

// 3. Fix Overdue Invoices === 1
content = content.replace(
  /statusLabel: formatOverdueString\(due, today\)/g,
  'statusLabel: "Overdue"'
);

// 4. Fix Upcoming Invs
const upcomingInvsLogicRegex = /let statusClass = "bg-slate-50 text-slate-700 border-slate-200"\s*let statusLabel = "Upcoming"\s*let textColor = "text-slate-700 font-medium"\s*if \(isBefore\(due, oneWeekFromNow\)\) \{\s*statusClass = "bg-orange-50 text-orange-700 border-orange-200"\s*statusLabel = "Due Soon"\s*textColor = "text-orange-600 font-medium"\s*\}/;

const newUpcomingLogic = `let statusClass = "bg-sky-50 text-sky-700 border-sky-200"
      let statusLabel = "Upcoming"
      let textColor = "text-sky-700 font-medium"

      if (isEqual(startOfDay(due), today)) {
        statusClass = "bg-orange-50 text-orange-700 border-orange-200"
        statusLabel = "Due Today"
        textColor = "text-orange-600 font-medium"
      }`;

content = content.replace(upcomingInvsLogicRegex, newUpcomingLogic);


fs.writeFileSync(file, content);
console.log('Fixed DashboardTab Due Status logic and headers');
