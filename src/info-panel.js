import React, {PureComponent} from 'react';

const defaultContainer = ({children}) => <div className="info-panel">{children}</div>;

export default class InfoPanel extends PureComponent {
  render() {
    const Container = this.props.containerComponent || defaultContainer;

    return (
      <Container>
        <h3>Erik Seglem - GGS 692</h3>
        <p>Map showing public lands in Virginia. Hover over a area to learn more about it. Click on a area to zoom to its extend.</p>
        <p>Data sources: 
        <li><a href="http://nrdata.nps.gov/programs/lands/nps_boundary.zip">National Park Service</a></li>
        <li><a href="https://www.dgif.virginia.gov/-/gis-data/VDGIF_Wildlife_Management_Area_WMA_Boundaries.zip">VDGIF Wildlife Management Areas</a></li>
        <li><a href="http://www.dof.virginia.gov/resources/gis/stforland_lcc.zip">VDOF State Forest</a></li>
        </p>
        <div className="source-link">
          <a href="https://github.com/eseglem/va-public-lands" target="_new">View Code ↗</a>
        </div>
      </Container>
    );
  }
}
