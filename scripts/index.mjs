import fs from "fs";
import chalk from "chalk"
import path from "path"

const resolve = (__dirname, ...file) => path.resolve(__dirname, ...file)
const log = (message) => console.log(chalk.green(`${message}`))
const successLog = (message) => console.log(chalk.blue(`${message}`))
const errorLog = (message) => console.log(chalk.red(`${message}`))
log('请输入要生成的“页面名称:页面描述”、会生成在/scr/Project目录下')

process.stdin.on('data', async (chunk) => {
  const content = String(chunk).trim().toString()
  const inputSearch = content.search(':')
  if (inputSearch == -1) {
    errorLog('格式错误，请重新输入')
    return
  }
  // 拆分用户输入的名称和描述
  const inputName = content.split(':')[0]
  const inputDesc = content.split(':')[1] || inputName
  // const isTs = process.env.npm_config_ts
  successLog(`将在 /src/Project 目录下创建${inputName}文件夹`)
  const targetPath = resolve('./src/Project', inputName)
  // 判断同名文件夹是否存在
  const pageExists = fs.existsSync(targetPath)
  if (pageExists) {
    errorLog('页面已经存在，请重新输入')
    return
  }

  // 获取multiPages.json文件内容，获取当前已有的页面集合
  await fs.readFile(
    path.resolve('./scripts', 'multiPages.json'),
    'utf-8',
    (err, data) => {
      //获取老数据
      let datas = JSON.parse(data)
      //和老数据去重
      let index = datas.findIndex((ele) => {
        return ele.chunk == inputName
      })
      if (index == -1) {
        //写入新页面的信息
        let obj = {
          chunk: inputName,
          chunkName: inputDesc
        }
        datas.push(obj)
        setFile(datas)
      }
    }
  )
  /**
   * 改变multiPages.json
   */
  function setFile(datas) {
    // 通过writeFile改变数据内容
    fs.writeFile(
      path.resolve('./scripts', 'multiPages.json'),
      JSON.stringify(datas),
      'utf-8',
      (err) => {
        if (err) throw err
        // 在project中建立新的目录
        fs.mkdirSync(targetPath)
        const sourcePath = resolve(
          './scripts/template'
        )
        copyFile(sourcePath, targetPath)
        process.stdin.emit('end')
      }
    )
  }
})

process.stdin.on('end', () => {
  console.log('exit')
  process.exit()
})

// 判断文件夹是否存在，不存在创建一个
const isExist = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path)
  }
}

//递归复制模版文件夹内的文件
const copyFile = (sourcePath, targetPath) => {
  const sourceFile = fs.readdirSync(sourcePath, { withFileTypes: true })

  sourceFile.forEach((file) => {
    const newSourcePath = path.resolve(sourcePath, file.name)
    const newTargetPath = path.resolve(targetPath, file.name)
    //isDirectory() 判断这个文件是否是文件夹，是就继续递归复制其内容
    if (file.isDirectory()) {
      isExist(newTargetPath)
      copyFile(newSourcePath, newTargetPath)
    } else {
      fs.copyFileSync(newSourcePath, newTargetPath)
    }
  })
}


// function getEntryPath() {
//   const map = {}; // 最后生成的多页面配置项
//   const PAGE_PATH = path.resolve(__dirname, "./src/Project"); // 指定要查询的目录
//   const entryFiles = fs.readdirSync(PAGE_PATH); // 获取到指定目录下的所有文件名
//   entryFiles.forEach((filePath) => {
//     map[filePath] = path.resolve(
//       __dirname,
//       `src/Project/${filePath}/index.html`
//     );
//   });
//   return map;
// }

// // 自定义底层的rollup打包配置
// rollupOptions: {
//   input: getEntryPath()
// }