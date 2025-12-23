import ReactDOM from "react-dom/client";
import App from "./App";
import '@ant-design/v5-patch-for-react-19';
import './index.css';
import '@/locales/i18n';

const container = document.getElementById('root')!;

const root = ReactDOM.createRoot(container);

root.render(<App/>);
