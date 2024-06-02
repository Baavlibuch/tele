import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Acknowledgement from '../components/acknowledgement';

test('renders Software Innovation Lab', () => {
	render(<Acknowledgement />);
	const linkElement = screen.getByText(/Software Innovation Lab/i);
	expect(linkElement).toBeInTheDocument();
});
