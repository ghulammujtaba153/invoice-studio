import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({apiKey: "AIzaSyB0mwCRLqyCXf4oqk4AsuOJEfsP_pi8xLM"})],
  model: 'googleai/gemini-2.0-flash',
});
   