import api from "./index";

export const getAllUsers = async () => {
  try {
    const res = await api.get("/users");
    return res;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

export const updateUserObject = async (userId: string, data: any) => {
  try {
    const res = await api.patch(`/users/${userId}`, data);
    return res;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

export const addUser = async (data: any) => {
  try {
    const res = await api.post("/users", data);
    return res;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};
