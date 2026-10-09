import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="d-flex bg-light min-vh-100">
            <Sidebar />
            <div className="flex-grow-1 p-4" style={{ marginLeft: '250px' }}>
                {children}
            </div>
        </div>
    );
};

export default Layout;