class AuthorizationError extends Error{
    /**
     * Authorization Error Exception
     * @param {string} message 
     * @param {string} context 
     */
    constructor(message, context) {
        super(message);

        console.error(context || "", "[AuthorizationError]", "[ErrorMessage]", message);
    }
}

module.exports = AuthorizationError;