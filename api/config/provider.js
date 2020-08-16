const config = require(".");
const glob = require("glob");
const path = require("path");

const importModuleRoutes = () => {
  glob.sync("api/modules/**/route.js").forEach((file) => {
    console.log(`Importando rotas de [${file}]`);
    require(path.resolve(file));
  });
};

const info = (file) => {
  const name = path.basename(path.dirname(file));
  const full = `${process.env.BASE_PATH}/${name}`;

  return {
    full,
    base: process.env.BASE_PATH,
    module: name,
  };
};

const provider = (filePath, controllerName = "controller") => {
  const server = require("../../app");
  const { full, module } = require("./provider").info(filePath);

  const Factory = require("./factory");
  const Controller = require(`../modules/${module}/${controllerName}`);

  const useMethod = (method) => {
    return useController(Controller, method);
  };
  const useController = (className, method) => {
    return Factory.build(className, method);
  };

  return {
    server,
    full,
    Factory,
    Controller,
    useController,
    useMethod,
  };
};

module.exports = {
  importModuleRoutes,
  info,
  provider,
};
