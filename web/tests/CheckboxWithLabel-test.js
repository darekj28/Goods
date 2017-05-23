'use strict';

const COMPONENT_DIR = 'ExampleComponentName'
const COMPONENT_NAME = '../ExampleComponentDirectory/ExampleComponentName'
jest.unmock(COMPONENT_NAME);

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
// import component name


describe(COMPONENT_NAME, () => {
	it('changes the text after click', () => {
		// Render a checkbox with label in the document
		const checkbox = TestUtils.renderIntoDocument(
			
		);

		const checkboxNode = ReactDOM.findDOMNode(checkbox);

		// Verify that it's Off by default
		expect(checkboxNode.textContent).toEqual('Off');

		// Simulate a click and verify that it is now On
		TestUtils.Simulate.change(
			TestUtils.findRenderedDOMComponentWithTag(checkbox, 'input')
		);
		expect(checkboxNode.textContent).toEqual('On');
	});

});
