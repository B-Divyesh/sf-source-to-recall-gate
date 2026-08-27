import '../../src/styles.css';
import { mountWorkbench } from '../../src/workbench';

const root = document.querySelector<HTMLElement>('.gate-app');
if (root) mountWorkbench(root);
