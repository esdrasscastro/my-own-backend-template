// Instancia um objeto em tempo de execução
module.exports = {
    build: (object, method) => {
        return (req, res, next) => {
            const obj = new object();
            return obj[method](req, res, next);
        }   
    }
};