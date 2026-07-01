import { Engine } from './engine/Engine';
import './style.css';

async function main(): Promise<void> {
  const engine = new Engine();
  await engine.init();
}

main().catch(console.error);
