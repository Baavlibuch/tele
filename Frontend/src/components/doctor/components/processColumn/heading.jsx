const Heading = ({headings, className}) => {

  return (
    <div className="heading">
      <div className={className}>
        {
          headings.map((heading, index) => (
            <div key={index}>{heading}</div>
          ))
        }
      </div>
    </div>
  );
}

export default Heading;
