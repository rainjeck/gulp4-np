// node create-component.js componentName

const cssExt = 'scss'; // 'styl' or 'scss'

const fs = require('fs');

function createComponent() {
  const componentName = process.argv.slice(2);

  // Check param - component name
  if (componentName.length == 0) {
    console.error('ERROR: Set Component Name');
    return;
  }

  const fName = componentName[0];
  const path = './src/components/' + fName;

  // Check folder
  if ( fs.existsSync(path) ) {
    console.log('ERROR: Folder "src/components/' + fName + '" exists');
  } else {
    // Create Dir
    fs.mkdirSync(path, {recursive: true}, (err) => {
      if (err) throw err;
    });
  }


  // Add css file
  // Check file
  if ( fs.existsSync(path +'/'+ fName +'.'+ cssExt) ) {
    console.log('ERROR: File "'+ path +'/'+ fName +'.'+ cssExt +'" exists');
  } else {
    // Create css file
    try {
      fs.appendFileSync(
        path + '/' + fName + '.' + cssExt,
        '/*!\n * --- '+ fName + '\n */'
      );
    } catch (err) {
      console.log(err);
    }
  }


  // Add pug file
  // Check file
  if ( fs.existsSync(path + '/' + fName +'.pug') ) {
    console.log('ERROR: File "'+ path + '/' + fName +'.pug" exists');
    return;
  } else {
    // Create pug file
    try {
      fs.appendFileSync(
        path + '/' + fName +'.pug',
        "mixin "+ fName +"()\n  .new "+ fName
      );
    } catch (err) {
      console.log(err);
    }
  }

  let fd;

  // Push @import to main
  try {
    fd = fs.openSync('./src/'+ cssExt +'/main.' + cssExt, 'a');
    fs.appendFileSync(fd, '\n@import "../components/'+ fName +'/'+ fName +'";', 'utf8');
  } catch (err) {
    console.log(err);
  } finally {
    if (fd !== undefined)
      fs.closeSync(fd);
  }

  // Push include to components.pug
  try {
    fd = fs.openSync('./src/pug/layout/components.pug', 'a');
    fs.appendFileSync(fd, '\ninclude ../../components/'+ fName +'/'+ fName, 'utf8');
  } catch (err) {
    console.log(err);
  } finally {
    if (fd !== undefined)
      fs.closeSync(fd);
  }

  console.log('COMPONENT "' + fName + '" HAS BEEN CREATED!');
}

createComponent();
