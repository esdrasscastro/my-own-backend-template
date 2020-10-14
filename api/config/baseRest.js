const fetch = require('node-fetch');

class BaseRest {
	constructor() {
		this.fetch = fetch;
		this.responseHandler = this.responseHandler.bind(this);
	}

	_replaceWith(input, replace) {
		var new_value;
		for (let old_value in replace) {
			new_value = replace[old_value];
			input = input.replace(RegExp(old_value, 'g'), new_value);
		}

		return input;
	}

	responseHandler(response, notFoundAsEmpty = false, ignoredStatus = [301, 302]) {
		if (ignoredStatus.includes(response.status)) return Promise.resolve(response);

		if (notFoundAsEmpty && response.status === 404) return Promise.resolve({});

		if (response.ok) {
			return response.json();
		}

		return response
			.json()
			.then((body) => {
				throw {
					module: this.module,
					body,
					statusCode: response.status,
					statusText: response.statusText,
				};
			})
			.catch((erro) => {
				if (erro.statusCode) throw erro;
				else {
					throw {
						module: this.module,
						statusCode: response.status,
						statusText: response.statusText,
					};
				}
			});
	}

	resolveURL(url, params) {
		return this._replaceWith(url, params);
	}

	_fetch(url, opts, respond_json = false) {
		return fetch(url, opts).then((response) => {
			if (respond_json) return response.json();
			return response;
		});
	}

	get(url, opts, respond_json = false, timeout = null) {
		opts.method = 'GET';
		opts.timeout = timeout * 1000 || 8000;
		return this._fetch(url, opts, respond_json);
	}

	post(url, opts, respond_json = false, timeout = null) {
		opts.method = 'POST';
		opts.timeout = timeout * 1000 || 8000;
		return this._fetch(url, opts, respond_json);
	}
}

module.exports = BaseRest;
