import { useLocation } from "react-router-dom";

function ProjectDetails(){

  const location = useLocation();
  const project = location.state;

  return(

    <div className="details-container">

      <h1>{project.name}</h1>

      <p>{project.desc}</p>

      <h3>Technology Stack</h3>
      <p>{project.tech}</p>

      <button className="join-btn">
        Join Project
      </button>

    </div>

  );
}

export default ProjectDetails;