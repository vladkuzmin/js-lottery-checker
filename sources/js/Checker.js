class Checker {
	constructor(opts={}){

		// Helpers
		this.isExist = (keys) => keys !== undefined && Object.keys(keys).length > 0;
		this.getID = (el) => document.querySelector(`#${el}`);

		// Settings
		this.selector = this.getID(opts.selector);
		this.balls = opts.balls;


		if (this.isExist(opts.extras)) this.extras = opts.extras;
		if (this.isExist(opts.filters)) this.filters = opts.filters;

		if (this.isExist(opts.template)) this.template = opts.template;
		
		if(this.isExist(opts.views)){
			this.views = opts.views;
			this.defaultView = opts.views.values[0];
		} else {
			this.defaultView = 'inline';
		}

		if( this.isExist(opts.cookies)) this.cookieValues = opts.cookies;

		// Runners
		this.checkCookies();
		this.initLines();

		this.build();

	}

	// Checking if object key is null
	// -------------------


	build(){

		const f = this.filters;
		const t = this.template;
		const v = this.views;
		
		let header, 
			content, 
			footer;

		// HEADER
		header = `
			<div>
				<h2>${t.header.text}</h2>
				${ v ? 
					`
						<label>
							<div>${v.label}</div>
							<input type="checkbox" id="${v.id}"/>
							${v.values.length > 1 ? 
								`
									<div>
										${v.text.map((x) =>
											`<span>${x}<span>`
										).join('')}
									</div>
								`
								:``
							}
						</label>
					` 
					: ``
				}
			</div>
		`;


		// CONTENT
		content = `
			<div id="${t.content.id}"></div>
		`;

		// FOOTER
		footer = `
			<div id="${t.footer.id}">
				<div id="${t.add.id}">${t.add.text}</div>
				
				${ f ? 
					`
						<div>
							${Object.keys(f).map((i) => `
								<label>
									<div>${f[i].label}</div>
									${f[i].input === 'select' ? 
										`
											<select id="${f[i].id}">
												${f[i].values.map((value, index)=>`
													<option value="${value}">${f[i].text[index]}</option>
												`).join('')}
											</select>
										`
										: ``
									}
								</label>
							`).join('')}
						</div>
					`
					: ``
				}

				<div>
					<div id="${t.reset.id}">${t.reset.text}</div>
					<input id="${t.submit.id}" type="submit" value="${t.submit.text}"/>
				</div>

			</div>
		`;

		this.selector.innerHTML = header + content + footer;
		this.init();
	}



	init(){

		const t = this.template;
		const form = this.selector;

		this.selectors = {};
		
		this.selectors.content = this.getID(t.content.id);
		this.selectors.add = this.getID(t.add.id);
		this.selectors.reset = this.getID(t.reset.id);
		this.selectors.submit = this.getID(t.submit.id);

		if (this.views && this.views.values.length > 1) this.selectors.view = this.getID(this.views.id)
		
		if (this.filters) {
			Object.keys(this.filters).map((key)=> {
				this.selectors[key] = this.getID(this.filters[key].id); 
			});
		}


		// add line
		// --------------
		this.selectors.add.addEventListener('click', () => {
			this.buildLine('add');
		});




		this.view();
	}
	

	// MODES
	view(){
		const view = this.selectors.view;
		if(view) {
			view.addEventListener('click', () => {
				this.defaultView = this.views.values[view.checked ? 1 : 0];
				this.render(this.defaultView);
			});
		}
		this.render(this.defaultView);
	}


	// INIT LINES
	// --------------------
	initLines(){
		
		const c = this.cookies;
		const b = this.balls;

		this.lines = [];

		if (this.isCookies) {
			Object.keys(c).map((x) => {
				c[x].map((json)=>{

				});
			});
		} else {
			this.addLine();
		}
	}

	addLine(){
		const b = this.balls;
		let obj = {}
		
		Object.keys(b).map((key) => {
			obj[key] = [];
		});
		this.lines.push(obj);
	}

	// TEMPLATE
	// ----------------------
	render(mode){

		this.currentIndex = 0;

		const t = this.template;
		const s = this.selectors;

		let lines = `<div id="${t.lines.id}"></div>`;
		let grid = `<div id="${t.grid.id}"></div>`;

		s.content.innerHTML = lines + (mode === 'inline' ? '' : grid);

		s.lines = this.getID(t.lines.id);
		if( mode !== 'inline') {
			s.grid = this.getID(t.grid.id);
			this.createGrid(s.grid);
		}

		this.lines.forEach(() => {
			this.buildLine();
		});
	}


	// ADD LINE
	buildLine(param){

		if(param){
			this.addLine();
		}

		const b = this.balls;
		const e = this.extras;
		
		let index = this.currentIndex;
		let line = document.createElement('div');
		line.className = "line";
		line.dataset.index = index;

		line.innerHTML = `
			<div class="numbers">
				${Object.keys(b).map((key) => `
					<ul>
					 ${Array.from(Array(b[key].select).keys()).map((x) => `
					 	<li>
							${this.defaultView === 'inline' ? 
							`
								<input 
									type="number"
									min="${b[key].startWith !== undefined ? `${b[key].startWith}` : `1`}"
									max="${b[key].pool}"
								/>
							`
							:
							` 
								 <span></span>
							`
						}
					 	</li>
					 `).join('')}
					</ul>
				`).join('')}
			</div>
			${e ? 
				`
					<div class="extras">
						${Object.keys(e).map((key)=>`
							<label ${ e[key].class ? `class="${e[key].class}"`:``}>
								<div>${e[key].label}</div>
								<input type="${e[key].input}" 
									${e[key].input === 'text' ? 
										`
											placeholder="${e[key].format}"
										`
										: ``
									}
								/>
							</label>
						`).join('')}
					</div>
				` 
				: ``
			}
			<div class="remove">x</div>
		`;

		this.selectors.lines.appendChild(line);


		let removeBtn = line.querySelector('.remove');
		removeBtn.addEventListener('click', () => {
			this.removeLine(removeBtn, index);
		});

		this.currentIndex += 1;

	}

	removeLine(item, index){
		item.parentNode.remove();
		this.lines.splice(index, 1);

		const lines = [...this.selectors.lines.querySelectorAll('.line')];
		
		lines.forEach((line, i) => {
			line.dataset.index = i;
		});
	}


	// GRID
	// ------------------------
	createGrid(selector){
		const b = this.balls;
		
		let grid = `
			${Object.keys(b).map((key) =>`
				<div id="${b[key].id}">
					${b[key].optional ? 
						`
							<label>
								<div>${b[key].label}</div>
								<input type="checkbox"/>
							</label>
						` 
						: ``
					}
					<div class="grid" ${b[key].optional ? `style="display:none;"` : ``}>
						<h3>${b[key].text}</h3>
						<ul>
							${Array.from(Array(b[key].pool).keys()).map((x)=>`
								<li>${b[key].startWith !== undefined ? `${x + b[key].startWith}`:`${x + 1}`}</li>
							`).join('')}
						</ul>
					</div>
				</div>
			`).join('')}
		`;
		
		selector.innerHTML = grid;

		// Init checkboxes and click events numbers
		// ------------------
		Object.keys(b).map((key, type) => {

			let parent = this.selectors.grid
							.querySelectorAll('div[id]')[type];

			let items = [...parent.querySelectorAll('li')];
			let checkbox = parent.querySelector('input');
			
			items.forEach((item, index) => {
				item.addEventListener('click', () => {
					this.addNumber(item, index, type);
				});
			});

			if(checkbox !== null) {
				checkbox.addEventListener('click', () => {
					this.addGrid(checkbox, parent.querySelector('.grid'), type);
				});
			}
		});
	}


	updateGrid(){};
	resetGrid(){};


	// ADD NUMBERS
	// ------------------
	addNumber(item, index, type){
		console.log(index, type);
	}

	addGrid(item, grid, type){
		grid.style.display = item.checked ? 'block' : 'none';
	}


	// COOKIES
	checkCookies(){
		let getCookie = (value) => document.cookie.replace(/(?:(?:^|.*;\s*)${value}\s*\=\s*([^;]*).*$)|^.*$/, "$1");

		const c = this.cookieValues;
		this.cookies = {};


		Object.keys(c).map((key, index) => {
			this.cookies[index] = [];
			c[key].map((x) => {
				this.cookies[index].push(getCookie(x));
			})
		});

		this.isCookies = this.cookies['0'][0] || this.cookies['0'][0] !== "" ? true : false;
	}

	createCookies(){}
	removeCookies(){}

}

export default Checker;