const svg = (props, children) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    {children}
  </svg>
);

const LeftArrow = (props) => svg(props, <path d="M15.5 3.5 7 12l8.5 8.5 1.8-1.8L10.6 12l6.7-6.7z" />);
const RightArrow = (props) => svg(props, <path d="M8.5 3.5 17 12l-8.5 8.5-1.8-1.8L13.4 12 6.7 5.3z" />);
const XButton = (props) => svg(props, <path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7l-1.4-1.4L9.2 12 2.9 5.7l1.4-1.4 6.3 6.3 6.3-6.3z" />);
const Upload = (props) => svg(props, <path d="M12 3 7 9h3.5v6h3V9H17zM4 18h16v3H4z" />);
const Generate = (props) => svg(props, <path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6zM18.5 14l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9zM5 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />);
const Loading = (props) => svg(props, <path d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7z" />);
const Edit = (props) => svg(props, <path d="M3 17.3V21h3.7L17.6 10.1l-3.7-3.7zm17.7-9.9a1 1 0 0 0 0-1.4l-2.7-2.7a1 1 0 0 0-1.4 0l-1.8 1.8 3.7 3.7z" />);
const Shirt = (props) => svg(props, <path d="M9 2 4 4.5 2.5 9l3 1.2V22h13V10.2l3-1.2L20 4.5 15 2a3 3 0 0 1-6 0z" />);
const Shorts = (props) => svg(props, <path d="M4 3h16l-.8 8.5L18 21h-4.5l-1-7.5h-1L10.5 21H6L4.8 11.5z" />);
const Pants = (props) => svg(props, <path d="M5 2h14l-.7 20h-4.6L12.5 9h-1L10.3 22H5.7z" />);
const Jacket = (props) => svg(props, <path d="M9 2 3 5v15h5V9h1v13h6V9h1v11h5V5l-6-3-3 4z" />);
const Dress = (props) => svg(props, <path d="M9 2h6l-1 5 5 15H5L10 7z" />);
const Shoe = (props) => svg(props, <path d="M2 11h6l3 3h8a3 3 0 0 1 3 3v3H2z" />);
const Clothing = (props) => svg(props, <path d="M7 2 3 4l1 4h2v14h12V8h2l1-4-4-2-2 3h-6zM9 10h6v10H9z" />);

export const Icons = {
  LeftArrow,
  RightArrow,
  XButton,
  Upload,
  Generate,
  Loading,
  Edit,
  Shirt,
  Shorts,
  Pants,
  Jacket,
  Dress,
  Shoe,
  Clothing,
};
