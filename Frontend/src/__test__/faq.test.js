import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import FAQ from '../components/faq/faq';

test('Video element is visible', () => {
	render(<FAQ />);
	const videoElements = screen.queryAllByTestId('video-element');
	// Iterate through the video elements and check their visibility
	videoElements.forEach((videoElement, index) => {
		// Assert that each video element is visible
		expect(videoElement).toBeVisible();
	});
});
