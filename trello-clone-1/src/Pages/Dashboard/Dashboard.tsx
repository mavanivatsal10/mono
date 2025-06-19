export default function Dashboard() {
  const userData = {
    fname: "john",
    lname: "doe",
    email: "j@j.com",
    position: "developer",
    projects: [
      {
        title: "my first project",
        cards: [],
      },
      {
        title: "my second project",
        cards: [],
      },
    ],
  };
  return (
    <div className="flex items-center justify-center my-12">
      <div className="flex gap-4">
        <div className="rounded-full p-4 bg-gray-300 text-3xl font-bold">
          {`${userData.fname.charAt(0).toUpperCase()}${userData.lname
            .charAt(0)
            .toUpperCase()}`}
        </div>
        <div>
          <h3 className="text-2xl font-bold">
            {userData.fname.charAt(0).toUpperCase() + userData.fname.slice(1)}{" "}
            {userData.lname.charAt(0).toUpperCase() + userData.lname.slice(1)}
          </h3>
          <hr />
          <p className="text-gray-500">{userData.email}</p>
          <p className="text-gray-500 text-sm">{userData.position}</p>
        </div>
      </div>
    </div>
  );
}
