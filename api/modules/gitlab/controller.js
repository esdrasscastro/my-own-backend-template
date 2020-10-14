const BaseRest = require('../../config/baseRest');
const redis = require('../../config/redis');

const config = {
	gitlab: {
		baseEndpoint: 'http://gitlab.intranet/api/v4/',
		baseTimeout: 30000,
		authorization: {
			username: 'tr641628',
			password: 'esc16esc',
			endpoint: 'http://gitlab.intranet/oauth/token',
		},
		projects: {
			endpoints: {
				repositoryFiles: 'projects/{ID}/repository/files/{FILENAME}?ref={BRANCH}',
			},
		},
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': 100,
			Host: 'localhost',
		},
	},
};

class GitlabController extends BaseRest {
	constructor() {
		super();

		this.context = '[Gitlab]';
		this.token = null;
		this.authorized = false;

		this.PROJECT_SERVERS_REDIS = 'projectsServers';
		this.PROJECT_REDIS = 'projects';
	}

	async autorize() {
		try {
			const data = JSON.stringify({
				grant_type: 'password',
				username: config.gitlab.authorization.username,
				password: config.gitlab.authorization.password,
			});

			return this.post(
				config.gitlab.authorization.endpoint,
				{
					body: data,
					headers: config.gitlab.headers,
				},
				true,
				config.gitlab.baseTimeout
			)
				.then((response) => {
					this.authorized = response;
					return response;
				})
				.catch((error) => {
					console.log(error);

					return false;
				});
		} catch (error) {
			console.log(error);
			return false;
		}
	}

	async getProjects(accessToken, search = '', page = 1, perPage = 100) {
		try {
			return this.get(
				`${config.gitlab.baseEndpoint}projects?per_page=${perPage}&page=${page}&search=${search}`,
				{ headers: { Authorization: `Bearer ${accessToken}` } },
				false,
				config.gitlab.baseTimeout
			)
				.then(async (r) => {
					if (r.ok) {
						const totalItems = r.headers.get('X-Total');
						const totalPages = r.headers.get('X-Total-Pages');
						const itemsPerPage = r.headers.get('X-Per-Page');
						const currentPage = r.headers.get('X-Page');
						const nextPage = r.headers.get('X-Next-Page');
						const prevPage = r.headers.get('X-Prev-Page');
						const data = r && (await r.json());

						return {
							totalItems,
							totalPages,
							itemsPerPage,
							currentPage,
							nextPage,
							prevPage,
							data,
						};
					}

					return false;
				})
				.then((rr) => {
					return rr;
				})
				.catch((e) => {
					console.log(e);
				});
		} catch (error) {
			console.log(error);
		}
		return false;
	}

	async getAllProjects(accessToken, search, page = 1) {
		if (!page) return;

		const response = await this.getProjects(accessToken, search, page);

		if (response.nextPage) {
			const { data } = await this.getAllProjects(accessToken, search, response.nextPage);
			response.data = [...response.data, ...data];
		}

		return response;
	}

	async getGroup(accessToken = '', groupname = '') {
		try {
			return this.get(
				`${config.gitlab.baseEndpoint}groups/${groupname}`,
				{ headers: { Authorization: `Bearer ${accessToken}` } },
				true,
				config.gitlab.baseTimeout
			)
				.then((response) => {
					return response;
				})
				.catch((error) => {
					console.log(error);

					return false;
				});
		} catch (error) {
			console.log(error);
			return false;
		}
	}

	async getFile(accessToken, projectID, filename, branch = 'master') {
		try {
			let path = '';
			path = config.gitlab.projects.endpoints.repositoryFiles.replace('{ID}', projectID);
			path = path.replace('{FILENAME}', filename);
			path = path.replace('{BRANCH}', branch);

			return this.get(
				`${config.gitlab.baseEndpoint}${path}`,
				{ headers: { Authorization: `Bearer ${accessToken}` } },
				true,
				config.gitlab.baseTimeout
			)
				.then((response) => {
					return response;
				})
				.catch((error) => {
					console.log(error);

					return false;
				});
		} catch (error) {
			console.log(error);
			return false;
		}
	}

	async getProjectsServers(projects = []) {
		let projectsServers = [];

		if (!this.authorized) {
			await this.autorize();
			if (!this.authorized) {
				throw new Error('Falha ao tentar fazer o login no gitlab');
			}
		}

		try {
			for (let i in projects) {
				const project = projects[i];

				const base64File = await this.getFile(this.authorized.access_token, project.id, 'jenkins.properties');

				if (base64File && base64File.message) {
					projectsServers.push({ id: project.id, name: project.name, servers: [], line: '' });
					continue;
				}

				const buff = Buffer.from(base64File.content || '', 'base64');
				const fileContent = buff.toLocaleString();
				const fileContentArray = fileContent.split(/(?:\r\n|\r|\n)/g);

				let selectedLine = '';
				let prdServers = fileContentArray.filter((line) => {
					if (!line) return false;

					const haveServers = line.includes('_SERVERS_PRD=') || line.includes('_SERVER_PRD=');
					const isNotCommented = line.indexOf('#', 0) === -1;
					if (haveServers && isNotCommented) {
						selectedLine = line;
						return true;
					}
				});

				prdServers = prdServers && prdServers[0];
				prdServers = prdServers && prdServers.replace(/ /g, '');
				prdServers = prdServers && prdServers.split('=');
				prdServers = prdServers && prdServers[1];
				prdServers = prdServers && prdServers.split(',');

				const projectServerAux = {
					id: project.id,
					name: project.name,
					servers: prdServers || [],
					line: selectedLine,
				};

				projectsServers.push(projectServerAux);
			}

			return projectsServers;
		} catch (error) {
			console.log(error);
		}

		return projectsServers;
	}

	async montaPlanoTecnico(modules = [], listProjects = []) {
		let projects = listProjects;

		try {
			if(!projects.length) {
				projects = await redis.get(this.PROJECT_SERVERS_REDIS);
			}

			let selectedProjects = [];

			if (!selectedProjects || (projects && projects.length)) {
				selectedProjects = projects.filter((project) => modules.includes(project.name));
			}

			if (!selectedProjects || (selectedProjects && !selectedProjects.length)) {
				throw new Error('Não existem projetos selecionados correspondentes informado');
			}

			const changedIC = this.mountICs(selectedProjects);
			const pipelines = this.mountPipelines(selectedProjects);
			const validations = this.mountValidations();

			const techPlan = {
				ics: changedIC,
				techPlan: pipelines.concat(validations),
			};

			return techPlan;
		} catch (error) {
			console.error(error && error.message);
		}
	}

	mountValidations() {
		return [
			{
				sequence: 100,
				name: '[VALIDAR] VALIDAR FUNCIONALIDADES',
				time: '120',
			},
			{
				sequence: 101,
				name: '[VALIDAR] VALIDAR AMBIENTES',
				time: '120',
				owner: 'OP_MINHAOIDIG_N2_OI',
			},
			{
				sequence: 90,
				name: '[LIMPEZA DE CACHE] LIMPAR CACHE NA CDN',
				time: 30,
			},
		];
	}

	mountPipelines(selectedProjects = []) {
		let pipelines = [];
		selectedProjects.map((sp, seq) => {
			pipelines.push({
				sequence: seq + 10,
				name: `[PIPELINE] EXECUTAR PIPELINE DA APLICAÇÃO ${sp.name.toUpperCase()}`,
				time: 30,
			});
		});

		return pipelines;
	}

	mountICs(selectedProjects = []) {
		let ics = [];

		selectedProjects.map((sp) => {
			if (sp.servers.length) {
				if (!ics.length) {
					ics = sp.servers;
				} else {
					ics = ics.concat(sp.servers);
				}
			}
		});

		ics = this.removeDuplicated(ics);

		const techPlanIC = [
			{
				type: 'Aplicação',
				name: 'MINHAOI3.0',
			},
		];

		ics.map((ic) => {
			techPlanIC.push({
				type: 'Sistema de Computador',
				name: ic,
			});
		});

		return techPlanIC;
	}

	removeDuplicated(arr = []) {
		const newArr = [];
		arr.map((a) => {
			if (!newArr.includes(a)) {
				newArr.push(a);
			}
		});

		return newArr;
	}

	async getProjectsList() {
		let projects = [];
		let projectsServers = [];

		try {
			projects = await redis.get(this.PROJECT_REDIS);
		} catch (error) {
			console.error(error && error.message);
		}

		if (projects && !projects.length) {
			const authorized = await this.autorize();

			let minhaoiProjectsName = [];
			let cadastroProjectsName = [];

			if (authorized) {
				// get minhaoi projects
				const minhaoiProjectsApiResponse = await this.getAllProjects(authorized.access_token, 'minhaoi', 1);
				const minhaoiProjects = {
					count: minhaoiProjectsApiResponse.totalItems,
					data: minhaoiProjectsApiResponse.data.filter((project) => project.name.includes('minhaoi-')),
				};

				const cadastroProjectsApiResponse = await this.getAllProjects(authorized.access_token, 'cadastro', 1);

				minhaoiProjectsName = minhaoiProjects.data.map((p) => ({ id: p.id, name: p.name }));
				cadastroProjectsName = cadastroProjectsApiResponse.data.map((p) => ({ id: p.id, name: p.name }));

				projects = [...minhaoiProjectsName, ...cadastroProjectsName];

				try {
					await redis.set(this.PROJECT_REDIS, projects);
				} catch (error) {
					console.error('Erro ao tentar salvar os projetos no redis');
				}
			}
		}

		if (projects && projects.length) {
			try {
				projectsServers = await redis.get(this.PROJECT_SERVERS_REDIS);
			} catch (error) {
				console.error(error && error.message);
			}

			if (projectsServers && !projectsServers.length) {
				projectsServers = await this.getProjectsServers(projects);
			}

			try {
				await redis.set(this.PROJECT_SERVERS_REDIS, projectsServers);
			} catch (error) {
				console.error('Erro ao tentar salvar os projetos com servidores de prd no redis');
			}
		}

		return {
			projects,
			projectsServers
		}
	}

	async icsList(req, res, next) {
		try {
			const selectedProjects = req.body;
			const list = await this.getProjectsList();
			const planoTecnico = await this.montaPlanoTecnico(selectedProjects, list.projectsServers);

			const ics = planoTecnico.ics.map((c) => c.name);
			const techPlan = planoTecnico.techPlan.map((c) => c.name);

			res.send(200, {
				ics,
				techPlan
			});

			return next();
		} catch (error) {
			console.log('Erro ao tentar buscar a lista de ics');
			res.send(500);
			return;
		}
	}

	async icsListAll(req, res, next) {
		try {
			const list = await this.getProjectsList();
			const pnames = list.projects.map(p => p.name);
			const planoTecnico = await this.montaPlanoTecnico(pnames, list.projectsServers);

			const ics = planoTecnico.ics.map((c) => c.name);
			const techPlan = planoTecnico.techPlan.map((c) => c.name);

			res.send(200, {
				ics,
				techPlan
			});

			return next();
		} catch (error) {
			console.log('Erro ao tentar buscar a lista de ics');
			res.send(500);
			return;
		}
	}

	async projectsList(req, res, next) {
		try {
			const projects = await this.getProjectsList();

			res.send(200, projects);
			return next();
		} catch (error) {
			console.log('Erro ao tentar buscar a lista de projetos');
			res.send(500);
			return;
		}
	}
}

module.exports = GitlabController;
