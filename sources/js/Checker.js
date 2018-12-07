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

		// Are checker buttons available? 
		// ################################
		this.availability = this._availability();
		this.arrAvailability = [];


		// Runners
		this.checkCookies();
		this.initLines();


		this.build();
	}

	// Checking if object key is null
	// -------------------
	_availability(){
		let obj = {};
		obj.result = false;
		if(this.extras) {
			Object.keys(this.extras).map((key)=>{
				if(this.extras[key].self === true){
					obj[key] = false;
				}
			});
		}
		return obj;
	}

	resetAvailability(){
		let index = this.currentIndex - 1;		
	}


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
				<input type="button" id="${t.add.id}" value="${t.add.text}" disabled/>
				
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
					<input id="${t.submit.id}" type="submit" value="${t.submit.text}" disabled/>
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
		let obj = {}
		
		// Numbers
		obj.result = {};

		Object.keys(b).map((key) => {
			obj.result[key] = [];
		});

		// Extras
		if(this.extras) {
			const ex = this.extras;
			Object.keys(ex).map((key) => {
				if(ex[key].input === 'checkbox') {
					obj[key] = false;
				} else {
					obj[key] = "";
				}
			});
		}

		this.lines.push(obj);

		// Reset footer buttons
		Object.keys(this.availability).map((key)=>{
			this.availability[key] = false;
		});

		
		// Add availability for each line
		let objAvalability = {};
		objAvalability.result = false;
		if(this.extras) {
			Object.keys(this.extras).map((key)=>{
				if(this.extras[key].self === true){
					objAvalability[key] = false;
				}
			});
		}
		
		this.arrAvailability.push(objAvalability);

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
											placeholder="${e[key].format}" maxlength="${e[key].format.length}"
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
		this.updateInputs(line, index);

		// Fill line Elements
		this.fillLine(index, 'insert');
		
		if(param && this.defaultView !== 'inline') {
			this.resetGrids();
		}

		// Set current index
		this.currentIndex += 1;

		// Check if line is valid
		this.checkLine(index);
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
					this.removeLine(i);
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

	updateInputs(){

		const lines = this.selectors.lines.querySelectorAll('.line');

		lines.forEach((line, index) => {

			// NUMBERS
			if(this.defaultView === 'inline') {
				const types = [...line.querySelector('.numbers').querySelectorAll('ul')];
				types.forEach((item) => {
					const inputs = [...item.querySelectorAll('input')];
					inputs.forEach((input) => {
						input.addEventListener('input', () => {
							this.fillLine(index, 'reset');
							this.checkLine(index);
						})
					});
				});
			}

			// EXTRAS
			Object.keys(this.extras).map((key, i) => {
				let input = line.querySelector(`.${this.extras[key].class} input`);
				if(input.type === 'checkbox') {
					input.addEventListener('click', (e)=>{
						this.lines[index][key] = input.checked === true ? true : false;
					})
				} else if (input.type === 'text') {
					var format = this.extras[key].format;
					input.addEventListener("input", ()=>{

						this.lines[index][key] = input.value;

						let isValid = false;
						if(input.value.length === format.length){
							isValid = this.isFormatValid(input.value, format);
							if(isValid) {
								input.classList.add('is-valid');
								this.availability[key] = true;	
							} else {
								input.classList.add('is-invalid');
								this.availability[key] = false;
							}
						}
						 else {
						 	input.classList.remove('is-valid', 'is-invalid');
						 	this.availability[key] = false;
						 }
						
						this.updateFooter();
					});
				}

			});

		});

	}

	isFormatValid(value, format) {
		value = [...value];
		format = [...format];
		let arr = [];
		
		value.forEach((value, i)=>{

			if (/^\d$/.test(value)) {
				arr.push(/^\d$/.test(format[i]) ? true : false)
			} else {
				arr.push(/^\d$/.test(format[i]) ? false : true)
			} 
		});

		return arr.indexOf(false) === -1 ? true : false;
	}

	
	fillLine(index, action){
		
		const mode = this.defaultView;
		const line = this.selectors.lines.querySelectorAll('.line')[index];

		// BALLS
		Object.keys(this.balls).map((key, i) => {
			
			// Remove all dublicates
			this.lines[index].result[key] = [... new Set(this.lines[index].result[key])];

			if(action === 'reset') this.lines[index].result[key] = [];
			let arr = this.lines[index].result[key];

			let tags = 	[...line.querySelector('.numbers')
							.querySelectorAll('ul')[i]
							.querySelectorAll(mode === 'inline' ? `input` : `span`)
						];

			tags.forEach((tag, n) => {
				
				let value;

				if(action === 'insert') {
					value = arr[n];
					tag[mode === 'inline' ? 'value' : 'innerHTML'] = value !== undefined ? value : ``;
				} else {
					value = tag[mode === 'inline' ? 'value' : 'innerHTML'];
					if( value !== "") {
						this.lines[index].result[key].push(value);
					}
				}

			});
		});

		// EXTRAS ___CONTINUE___
		Object.keys(this.extras).map((key, i) => {
			let input = line.querySelector(`.${this.extras[key].class} input`);
			if(input.type === 'checkbox') {
				input.checked = this.lines[index][key];
			} else if (input.type === 'text') {
				input.value = this.lines[index][key];
			}
		});
	}


	resetLines(){
		this.lines = [];
		this.addLine();
	}


	removeLine(index) {
		// Remove DOMElement and Object
		this.lines.splice(index, 1);
		this.view();
	}

	checkLine(inx){

		let i = inx !== undefined ? inx : this.currentIndex - 1;

		const line = this.lines[i];

		let tempArr = [];
		let obj = {};

		// Check balls
		// ---------------------------
		Object.keys(this.balls).map((key, index) => {

			let isDublicated = this.checkLineDublicates(line.result[key], index, i);

			// Check length
			if(!this.balls[key].optional){
				tempArr.push(
					line.result[key].length === this.balls[key].select && !isDublicated
					? true 
					: false
				);
			}
		});

		obj.result = tempArr.every((val, i, arr) => val === true );

		// Validate line? 
		Object.keys(obj).map((key) => {
			this.availability[key] = obj[key] ? true : false;
 			this.updateFooter();
			return;
		});

		this.arrAvailability[inx].result = obj.result;
	}

	checkLineDublicates(arr, index, line) {
		let dublicates = [];
		arr.forEach((value, i) => {
			if(arr.indexOf(value, i + 1) > -1) {	
				if(dublicates.indexOf(value) === -1 ) {
					dublicates.push(value);
				}
			}
		});

		let isDublicated = dublicates.length > 0 ? true : false;
		
		// Show dublicates
		this.showDublicates(dublicates, index, line);

		return isDublicated;
	}

	showDublicates(arr, index, line) {

		line = this.selectors.lines.querySelectorAll('.line')[line];

		let tags = 	[...line.querySelector('.numbers')
							.querySelectorAll('ul')[index]
							.querySelectorAll(`input`)
					];

		let values = [];

		tags.forEach((tag) => {
			values.push(tag.value);
			tag.classList.remove('is-dublicated');
		});

					
		if( arr.length === 0 ) return false;

		// Current line

		arr.forEach((value) => {
			let indexes = values.reduce((a, e, i) => (e === value) ? a.concat(i) : a, []);

			indexes.forEach((i) =>{
				tags[i].classList.add('is-dublicated');
			});
		});

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
		
		// Remove from lines if unchecked
		if(!isChecked) {
			this.lines[i].result[Object.keys(this.lines[i].result)[type]] = [];
			this.updateGrids();
			// this.fillLine(i, 'insert');
		}
	}


	// FOOTER
	// --------------------
	updateFooter(){
		const s = this.selectors;
		let boolean = false;
		let arr = [];

		Object.keys(this.availability).map((key) => {
			arr.push(this.availability[key]);
		});

		
		if(arr.indexOf(true) !== -1 ) {
			boolean = true;
		}

		s.add.disabled = boolean ? false : true;
		s.submit.disabled = boolean ? false : true;
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