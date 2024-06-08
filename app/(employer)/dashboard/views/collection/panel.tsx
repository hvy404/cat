import React from "react";

interface CollectionPanelMainProps {
  entryID: string;
}

const CollectionPanelMain = ({ entryID }: CollectionPanelMainProps) => {

  return (
    <div>
     <h2>{entryID}</h2>
    </div>
  );
}

export default CollectionPanelMain;
