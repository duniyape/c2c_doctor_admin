import { createContext, useContext, useEffect, useState } from "react";
import useApi from "../api/useApi";
import Cookies from "js-cookie";
import { useNavigate } from "react-router";

// Create context
const UserContext = createContext(null);

// Provider component
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const { postData } = useApi();
    const navigate = useNavigate();
    const [role, setRole] = useState(Cookies.get("role")); // Store role in state

    useEffect(() => {
        const fetchUserProfile = async () => {
            const empID = Cookies.get("EmpID");

            if (!Cookies.get("user")) {
                navigate("/login");
                return;
            }
            const allPermissions = ["Setting","Staff",'Refund','Reports','Reschedule','OPD',"Receipt",'Dashboard'];

            if (role === "doctor") {
                setUser({ permissions: allPermissions }); // Doctor has full access
                console.log("Doctor role detected");
            } else {
                try {
                    console.log("Fetching employee profile...");
                    const res = await postData(`/get_profile/${empID}/`, {});
                    if (res) setUser(res);
                } catch (error) {
                    console.error("Error fetching profile:", error);
                }
            }
        };

        fetchUserProfile();
    }, [role]); // Fetch profile only when role changes

    // Efficient cookie change detection using MutationObserver
    useEffect(() => {
        const observer = new MutationObserver(() => {
            const newRole = Cookies.get("role");
            if (newRole !== role) {
                setRole(newRole);
            }
        });

        observer.observe(document, { subtree: true, childList: true, attributes: true });

        return () => observer.disconnect(); // Cleanup observer on unmount
    }, [role]);

    return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

// Custom hook to access user data
export const useUser = () => useContext(UserContext);
