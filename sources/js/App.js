import $ from './Functions';
import Checker from './Checker';

const App = {
	init: init
}

function init(){
	$.init();
	new Checker({

		selector: 'checker',
		views: {
			id: 'checker-mode',
			label: 'View mode',
			values: ['inline', 'grid'],
			text: ['Inline', 'Grid']
		},
		
		balls: {
			ball: {
				id: 'checker-grid-ball',
				name: 'ball',
				text: 'Ball',
				pool: 50,
				select: 5,
				optional: false,
				startWith: 0,
				repeated: 0
			},
			powerball: {
				id: 'checker-grid-powerball',
				name: 'powerball',
				text: 'Powerball',
				pool: 10,
				select: 2,
				optional: false,
				startWith: 1,
				repeated: 4
			},
			bonus: {
				id: 'checker-grid-bonus',
				name: 'bonus',
				text: 'Bonus',
				pool: 10,
				select: 1,
				optional: true,
				label: 'Would you like to add Powerball to your ticker?',
				startWith: 0,
				repeated: 0
			}
		},

		extras: {
			multiplier: {
				label: 'Multiplier',
				input: 'checkbox',
				class: 'checker-multiplier'
			},
			raffle: {
				label: 'Raffle',
				input: 'text',
				class: 'checker-raffle',
				format: 'ABCD12345'
			}
		},

		filters: {
			periods: {
				id: 'checker-period',
				label: 'Period',
				input: 'select',
				values: [7, 30, 180],
				text: ['7 days', '30 days', '180 days']
			},
			days: {
				id: 'checker-days',
				label: 'Which draws',
				input: 'select',
				values: ['Tuesday', 'Monday'],
				text: ['Tuesday', 'Monday']
			}
		},

		template: {
			header: {
				id: 'checker-header',
				text: 'Enter numbers'
			},
			content: {
				id: 'checker-content',
				text: '',
			},
			lines: {
				id: 'checker-lines',
				text: ''
			},
			grid: {
				id: 'checker-grid',
				text: '',
			},
			add: {
				id: 'checker-add',
				text: '+ Add Line'
			},
			footer: {
				id: 'checker-footer',
				text: ''
			},
			reset: {
				id: 'checker-reset',
				text: 'Reset'
			},
			submit: {
				id: 'checker-submit',
				text: 'Check'
			}
		},

		cookies: {
			main: ['checkingNumbers'],
			extras: ['checkingPeriods', 'checkingDays'],
		}
	});
}

App.init();
