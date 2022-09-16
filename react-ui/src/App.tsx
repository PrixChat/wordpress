import { Outlet, Route, Routes } from "react-router-dom";
import { PrixProvider } from "./components/PrixProvider";
import Chat from "./components/Chat";
import Sidebar from "./components/Layouts/Sidebar";
import Welcome from "./components/Welcome";
import DeleteMessageDialog from "./components/Layouts/DeleteMessageDialog";

function App() {
  return (
    <PrixProvider>
      <div className="pc-wrapper">
        <Sidebar />
        <main>
          <Routes>
            <Route path="c" element={<Outlet />}>
              <Route path=":url" element={<Chat />} />
            </Route>
            <Route path="*" element={<Welcome />} />
          </Routes>
          
          <DeleteMessageDialog />
        </main>
      </div>
    </PrixProvider >
  )
}

export default App
