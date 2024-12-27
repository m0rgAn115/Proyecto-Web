import React from "react";

class Tarjeta extends React.Component {
  constructor() {
    super();
  }

  render(){
    const { bg_color, title } = this.props

    return (
      <div className={`mx-auto px-18  py-10 rounded-md w-1/2 ${bg_color ? bg_color : "bg-blue-500"} `}>
        <h2 className=" font-bold text-white text-center " >{title}</h2>
      </div>
    )
  }
}

export default Tarjeta;