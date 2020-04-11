class RepositoryError extends Error{
    /**
     * Repository Error Exception
     * @param {string} message 
     * @param {string} context 
     */
    constructor(message, context) {
        super(message);

        console.error(context || "", "[RepositoryError]", "[ErrorMessage]", message);
    }
}

module.exports = RepositoryError;