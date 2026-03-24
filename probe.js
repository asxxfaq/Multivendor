const fs = require('fs');
fetch('https://multivendor-api-seven.vercel.app/api/products/featured')
  .then(res => res.text())
  .then(body => {
    fs.writeFileSync('probe-output.txt', body);
    console.log('Saved to probe-output.txt');
  })
  .catch(console.error);
