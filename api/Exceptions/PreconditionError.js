class PreconditionError extends Error{
    /**
     * Precondition Error Exception
     * @param {string} message 
     * @param {string} context 
     */
    constructor(message, context) {
        super(message);

        console.error(context || "", "[PreconditionError]", "[ErrorMessage]", message);
    }
}

module.exports = PreconditionError;