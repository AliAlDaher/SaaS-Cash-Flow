const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/const \[expectedDate, setExpectedDate\] = useState\(format\(new Date\(\), 'yyyy-MM-dd'\)\)\r?\n\s*const \[expectedDate, setExpectedDate\] = useState\(format\(new Date\(\), 'yyyy-MM-dd'\)\)/, "const [expectedDate, setExpectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))");

content = content.replace(/setExpectedDate\(coll\.expectedDate \? format\(new Date\(coll\.expectedDate\), 'yyyy-MM-dd'\) : format\(new Date\(\), 'yyyy-MM-dd'\)\)\r?\n\s*setExpectedDate\(coll\.expectedDate \? format\(new Date\(coll\.expectedDate\), 'yyyy-MM-dd'\) : format\(new Date\(\), 'yyyy-MM-dd'\)\)/, "setExpectedDate(coll.expectedDate ? format(new Date(coll.expectedDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'))");

content = content.replace(/setExpectedDate\(format\(new Date\(\), 'yyyy-MM-dd'\)\)\r?\n\s*setExpectedDate\(format\(new Date\(\), 'yyyy-MM-dd'\)\)/, "setExpectedDate(format(new Date(), 'yyyy-MM-dd'))");

fs.writeFileSync(file, content);
