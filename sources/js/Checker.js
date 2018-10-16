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
			<div id="${t.header.id}">
				<h2>${t.header.text}</h2>
				${ v ? 
					`
						<label>
							<div>${v.label}</div>
							<input type="checkbox" id="${v.id}" ${this.defaultView !== v.values[0] ? `checked` : ``}/>
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
				<input type="button" id="${t.add.id}" value="${t.add.text}"/>
				
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

		this.selectors.reset.addEventListener('click', () => {
			this.resetLines();
			this.build();
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

		this.lines.forEach(() => {
			this.buildLine();
		});
		
		if( mode !== 'inline') {
			s.grid = this.getID(t.grid.id);
			this.createGrids(s.grid);
		}
	}


	// INIT LINES
	// --------------------
	initLines(){
		
		const c = this.cookies;
		const b = this.balls;

		this.lines = [];

		if (this.isCookies) {
			Object.keys(c).map((x) => {
				c[x].map((json) => {

				});
			});
		} else {
			this.addLine();
		}
	}

	addLine(){
		const b = this.balls;
		const ex = this.extras;
		
		let obj = {}
		
		// Numbers
		obj.result = {};

		Object.keys(b).map((key) => {
			obj.result[key] = [];
		});

		// Extras
		Object.keys(ex).map((key) => {
			if(ex[key].input === 'checkbox') {
				obj[key] = false;
			} else {
				obj[key] = "";
			}
		});

		this.lines.push(obj);
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
							` <span></span>`
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
		`;

		this.selectors.lines.appendChild(line);
		this.checkRemoveButtons();

		// Init inputs if mode is inline
		if(this.defaultView === 'inline') {
			const types = [...line.querySelector('.numbers').querySelectorAll('ul')];
			types.forEach((item) => {
				const inputs = [...item.querySelectorAll('input')];
				inputs.forEach((input) => {
					input.addEventListener('input', () => {
						this.fillLine(index, 'reset');
					})
				});
			});
		}

		this.fillLine(index, 'insert');
		
		if(param && this.defaultView !== 'inline') {
			this.resetGrids();
		}

		// Set current index
		this.currentIndex += 1;
	}

	checkRemoveButtons(){

		let lines = [...this.selectors.lines.querySelectorAll('.line')];
		let t = this.template.remove;
		let remove;

		// Clear remove buttons
		lines.forEach((line) => {
			remove = line.querySelector(`.${t.class}`);
			if(remove !== null) {
				remove.remove();
			}
		});

		// Re-create remove buttons
		if(lines.length > 1) {
			lines.forEach((line, i) => {
				remove = document.createElement('div');
				remove.className = t.class;
				remove.innerHTML = t.text;

				let isRemove = line.querySelector(`.${t.class}`);
				if( isRemove === null) line.appendChild(remove);

				// add event handler
				remove.addEventListener('click', () => {
					this.removeLine(remove, i);
				});
			});
		}
	}


	updateNumbersOnClick(el, action, index, type){
		
		let num  = el.innerHTML.replace(/\D+/g, '');
		let key = Object.keys(this.balls)[type];
		let arr = this.lines[index].result[key];

		if(action === 'add') {
			arr.push(num);
		} else {
			let removed = arr.indexOf(num);
			arr.splice(removed, 1);
		}

		this.fillLine(index, 'insert');
	}

	
	fillLine(index, action){
		
		const mode = this.defaultView;
		const line = this.selectors.lines.querySelectorAll('.line')[index];

		Object.keys(this.balls).map((key, i) => {

			if(action === 'reset') this.lines[index].result[key] = [];

			let tags = [...line.querySelector('.numbers').querySelectorAll('ul')[i].querySelectorAll(mode === 'inline' ? `input` : `span`)];
			tags.forEach((tag, n) => {

				let value;

				if(action === 'insert') {
					value = this.lines[index].result[key][n];
					tag[mode === 'inline' ? 'value' : 'innerHTML'] = value !== undefined ? value : ``;
				} else {
					value = tag[mode === 'inline' ? 'value' : 'innerHTML'];
					if( value !== "" ) this.lines[index].result[key].push(value); 
				}

			});
		});

	}


	resetLines(){
		this.lines = [];
		this.addLine();
	}


	removeLine(item, index){
		
		const lines = [...this.selectors.lines.querySelectorAll('.line')];
		
		item.parentNode.remove();
		this.lines.splice(index, 1);

		
		lines.forEach((line, i) => {
			line.dataset.index = i;
		});

		this.checkRemoveButtons();
		this.currentIndex -= 1;

		this.updateGrids();
	}

	checkLine(){

		const i = this.currentIndex - 1;
		
		let isValid = false;
		const line = this.lines[i];

		Object.keys(line.result).map((key, index)=>{
			// Line is completed
			console.log(key);

		});

		return isValid;
	}


	// GRID
	// ------------------------
	createGrids(selector) {
		
		const b = this.balls;
		const i = this.lines.length - 1;

		let grid = `
			${Object.keys(b).map((key, index) =>`
				<div id="${b[key].id}">
					${b[key].optional ? 
						`
							<label>
								<div>${b[key].label}</div>
								<input type="checkbox" ${this.lines[i].result[key].length > 0 ? `checked` : ``}/>
							</label>
						` 
						: ``
					}
					<div class="grid" 
						${b[key].optional && this.lines[i].result[key].length === 0 ? 
							`style="display:none;"` : ``
						}
					>
						<h3>${b[key].text}</h3>
						<ul>
							${Array.from(Array(b[key].pool).keys()).map((x)=>`
								<li data-num="${b[key].startWith !== undefined ? `${x + b[key].startWith}`:`${x + 1}`}"							>
									${b[key].startWith !== undefined ? `${x + b[key].startWith}`:`${x + 1}`}
								</li>
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
					this.addGridNumber(item, index, type);
				});
			});

			if(checkbox !== null) {
				checkbox.addEventListener('click', () => {
					this.addGrid(checkbox, parent.querySelector('.grid'), type);
				});
			}
		});

		this.updateGrids();
	}


	// ADD NUMBERS
	// ------------------
	addGridNumber(item, index, type){
		
		const i = this.currentIndex - 1;
		const line = this.selectors.lines.querySelectorAll('.line')[i];

		let status = item.dataset.status;
		let action;

		// Check if number is already chosen
		if( status === "selected" ) {
			item.setAttribute('data-status', "");
			action = 'remove';
		} else {
			item.setAttribute('data-status', "selected");
			action = 'add';
		}
		this.updateNumbersOnClick(item, action, i, type);
		this.updateGrids();
		this.checkLine();
	}

	updateGrids(){

		if(this.defaultView !== 'inline') {

			const i = this.currentIndex - 1;
			const grids = [...this.selectors.grid.querySelectorAll('ul')];
			const line = this.lines[i];

			Object.keys(this.balls).map((key, index ) => {


				// Show optional selection if exists
				if(this.balls[key].optional) {
					
					let parent = grids[index].parentNode;
					let checkbox = parent.parentNode.querySelector('label input');
					
					if( line.result[key].length > 0 ) {
						checkbox.checked = true;
						this.addGrid(checkbox, parent, null);
					}
				}

				
				let nums = [...grids[index].querySelectorAll('li')];
				
				nums.forEach((num) => {

					num.classList.remove('is-disabled');
					num.classList.remove('is-active');
					num.setAttribute('data-status', '');

					if (line.result[key].length === this.balls[key].select) {
						num.classList.add('is-disabled');
						num.setAttribute('data-status', 'disabled');
					}

					if(line.result[key].indexOf(num.dataset.num) >= 0 ) {
						num.classList.remove('is-disabled');
						num.classList.add('is-active');
						num.setAttribute('data-status', 'selected');
					}
				});
			});
		}
	};
	
	resetGrids(){
		const grids = [...this.selectors.grid.querySelectorAll('ul')];
		grids.forEach((grid, index) => {
			let nums = [...grid.querySelectorAll('li')];
			nums.forEach((num)=>{
				num.removeAttribute('data-status');
				num.classList.remove('is-active');
				num.classList.remove('is-disabled');
			});
		});
	};


	addGrid(item, grid, type){
		let i = this.currentIndex - 1;
		let isChecked = item.checked;
		grid.style.display = isChecked ? 'block' : 'none';
		console.log(Object.keys(this.lines[i])[type]);
		
		// Remove from lines if unchecked
		if(!isChecked) {
			this.lines[i].result[Object.keys(this.lines[i].result)[type]] = [];
			this.updateGrids();
			this.fillLine(i, 'insert');
		}
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