import minimist from 'minimist';
import * as _ from 'lodash-es';

function createProxy(object) {
  return new Proxy(object, {
    apply(target, thisArg, argArray) {
      return Reflect.apply(target, thisArg, argArray);
    },
    get(target, prop, receiver) {
      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }
      if ("default" in target) {
        return Reflect.get(target, "default", receiver);
      }
      throw new Error(`no such command: ${prop}`);
    }
  });
}
async function run(subcmdObject, ministOpts) {
  const proxySubcmdObject = createProxy(subcmdObject);
  const argsObject = minimist(process.argv.slice(2), ministOpts);
  if (argsObject.help) {
    console.log(proxySubcmdObject);
    return;
  }
  if (argsObject.edit) {
    const sourceFile = process.argv[1];
    console.log(sourceFile);
    return;
  }
  if (argsObject.debug) {
    console.log("process.argv:", process.argv);
    console.log("argv of minist:", argsObject);
  }
  const subCmds = argsObject._;
  if (!subCmds) {
    throw new Error(`please specify a valid subcommand. and handler current is ${subCmds}`);
  }
  if (subCmds.length === 0) {
    console.log("please specify a valid subcommand.");
    return;
  }
  try {
    let curProxyCmdObject = proxySubcmdObject;
    for (const cmd of subCmds) {
      const cmdObjectOrFn = curProxyCmdObject[cmd];
      if (_.isFunction(cmdObjectOrFn)) {
        //@ts-ignore
        await cmdObjectOrFn.call(curProxyCmdObject, argsObject, proxySubcmdObject);
        return;
      }
      if (_.isObject(cmdObjectOrFn)) {
        curProxyCmdObject = cmdObjectOrFn;
        continue;
      }
      throw new Error(`no such command: ${cmd} of ${subCmds.join("=>")}`);
    }
  } catch (e) {
    console.log("\n====argv of minist:====\n", argsObject);
    console.log(`file: ${process.argv[1]}`);
    console.error(e);
  }
}

export { run };
