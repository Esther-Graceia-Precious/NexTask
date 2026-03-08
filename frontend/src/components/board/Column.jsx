function Column({ title, tasks }) {
  return (
    <div style={{
      width: "30%",
      background: "#f4f4f4",
      padding: "10px",
      borderRadius: "10px"
    }}>
      <h3>{title}</h3>

      {tasks.map((task) => (
        <div key={task._id} style={{
          background: "white",
          padding: "10px",
          margin: "10px 0",
          borderRadius: "8px"
        }}>
          <h4>{task.title}</h4>
          <p>{task.description}</p>
        </div>
      ))}
    </div>
  );
}

export default Column;