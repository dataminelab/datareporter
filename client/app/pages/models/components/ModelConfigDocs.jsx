import React from "react";


function ModelConfigDocs() {

  return (<>
      <h1>
        <strong>Model&nbsp;</strong>
      </h1>
      <p>
    <span style={{ fontWeight: 400 }}>
      The model stores information about the data source. The model stores table
      information from a data source. The model is the setting of the model to
      display data from the database.
    </span>
      </p>
      <p>
    <span style={{ fontWeight: 400 }}>
      To create a model, you need to click on the New Model button
    </span>
      </p>
      <p>
    <span style={{ fontWeight: 400 }}>
      The model creation form will be displayed.
    </span>
      </p>
      <p>
        <span style={{ fontWeight: 400 }}>With fields</span>
      </p>
      <p>
        <strong>name</strong>
        <span style={{ fontWeight: 400 }}>: model name</span>
      </p>
      <p>
        <strong>connection</strong>
        <span style={{ fontWeight: 400 }}>: database connection</span>
      </p>
      <p>
        <strong>table</strong>
        <span style={{ fontWeight: 400 }}>: table from database</span>
      </p>
      <p>
    <span style={{ fontWeight: 400 }}>
      After creating the model you redirect to the config editor page of the
      model.
    </span>
      </p>
      <p>
        <a href="https://youtu.be/K7qsB0Gx95g" target="_blank">
          <span style={{ fontWeight: 400 }}>https://youtu.be/K7qsB0Gx95g</span>
        </a>
      </p>
      <h1>
        <strong>Configuring Model</strong>
      </h1>
      <h2>
        <strong>Overview</strong>
      </h2>
      <p>
        <span style={{ fontWeight: 400 }}>The top level </span>
        <span style={{ fontWeight: 400 }}>dataCubes:</span>
        <span style={{ fontWeight: 400 }}>
      {" "}
          key that holds the data cubes that will be loaded into Datareporter. The
      order of the data cubes in the config will define the ordering seen in the
      UI.
    </span>
      </p>
      <h2>
        <strong>Basic data cube properties</strong>
      </h2>
      <p>
    <span style={{ fontWeight: 400 }}>
      Described here are only the properties which you might want to change.
    </span>
      </p>
      <p>
        <strong>name</strong>
        <strong> (string)</strong>
      </p>
      <p>
        <strong>
          The name of the data cube as used internally in Datareporter and used in
          the URLs. This should be a URL safe string. Changing this property for a
          given data cube will break any URLs that someone might have generated for
          that data cube in the past.
        </strong>
      </p>
      <p>
        <strong>title</strong>
        <strong> (string)</strong>
      </p>
      <p>
        <strong>
          The user visible name that will be used to describe this data cube in the
          UI. It is always safe to change this.
        </strong>
      </p>
      <p>
        <strong>&nbsp;timeAttribute: sometimeLater</strong>
      </p>
      <p>
        <strong>clusterName</strong>
        <strong> (string)</strong>
      </p>
      <p>
        <strong>
          The cluster that the data cube belongs to (or “native” if this is a file
          based data cube).
        </strong>
      </p>
      <p>
        <strong>defaultSortMeasure</strong>
        <strong> (string), default: the first measure</strong>
      </p>
      <p>
        <strong>
          The name of the measure that will be used for default sorting. It is
          commonly set to the measure that represents the count of events.
        </strong>
      </p>
      <p>
        <strong>defaultSelectedMeasures</strong>
        <strong> (string[]), default: first four measures</strong>
      </p>
      <p>
        <strong>The names of the measures that will be selected by default.</strong>
      </p>
      <h2>
        <strong>Attribute Overrides</strong>
      </h2>
      <p>
        <strong>
          While a Datareporter tries to learn as much as it can from your data cube
          from a data source. It can not (yet) do a perfect job. The{" "}
        </strong>
        <strong>attributeOverrides:</strong>
        <strong> section of the data cube is there for you to fix that.</strong>
      </p>
      <p>
        <strong>name</strong>
        <strong> (string)</strong>
      </p>
      <p>
        <strong>The name of the attribute (column) from data source.&nbsp;</strong>
      </p>
      <p>
        <strong>
          Here are some common scenarios where you should add an attribute override:
        </strong>
      </p>
      <h2>
        <strong>Dimensions</strong>
      </h2>
      <p>
        <strong>
          In this section you can define the dimensions that users can{" "}
        </strong>
        <strong>
          <em>split</em>
        </strong>
        <strong> and </strong>
        <strong>
          <em>filter</em>
        </strong>
        <strong>
          {" "}
          on in the UI. Dimensions may be organized as list or tree where each item
          of list can be either a dimension or{" "}
        </strong>
        <a href="https://allegro.github.io/turnilo/configuration-datacubes.html#dimension-group">
          <strong>dimension group</strong>
        </a>
        <strong>
          {" "}
          having its own dimensions list or tree. The order of the dimension list in
          the top of the left panel is determined by the order of the dimensions
          definitions in this section.
        </strong>
      </p>
      <h3>
        <strong>Dimension</strong>
      </h3>
      <p>
        <strong>Dimensions are defined with following attributes:</strong>
      </p>
      <p>
        <strong>name</strong>
        <strong> (string)</strong>
      </p>
      <p>
        <strong>
          The name of the dimension. This does not have to correspond to the
          attribute name (but the auto generated dimensions do). This should be a
          URL safe string and unique across dimensions, dimension groups, measures
          and measure groups. Changing this property will break any URLs that
          someone might have generated that include this dimension.
        </strong>
      </p>
      <p>
        <strong>title</strong>
        <strong> (string)</strong>
      </p>
      <p>
        <strong>
          The title for this dimension in the UI. Can be anything and is safe to
          change at any time.
        </strong>
      </p>
      <p>&nbsp;</p>
      <h2>
        <strong>Measures</strong>
      </h2>
      <p>
        <strong>In this section you can define the measures that users can </strong>
        <strong>
          <em>aggregate</em>
        </strong>
        <strong> on (</strong>
        <strong>
          <em>apply</em>
        </strong>
        <strong>
          ) on in the UI. Measures may be organized as list or tree where each item
          of list can be either a measure or{" "}
        </strong>
        <a href="https://allegro.github.io/turnilo/configuration-datacubes.html#measure-group">
          <strong>measure group</strong>
        </a>
        <strong>
          {" "}
          having its own measures list or tree. The order of the measure list in the
          bottom of the left panel is determined by the order of the measure
          definitions in this section.
        </strong>
      </p>
      <h3>
        <strong>Measure</strong>
      </h3>
      <p>
        <strong>Measures are defined with following attributes:</strong>
      </p>
      <p>
        <strong>name</strong>
        <strong> (string)</strong>
      </p>
      <p>
        <strong>
          The name of the measure. This should be a URL safe string. Changing this
          property will break any URLs that someone might have generated that
          include this measure.
        </strong>
      </p>
      <p>
        <strong>title</strong>
        <strong> (string)</strong>
      </p>
      <p>
        <strong>formula</strong>
        <strong> (string - plywood expression)</strong>
      </p>
      <p>
        <strong>The </strong>
        <a href="http://plywood.imply.io/expressions">
          <strong>Plywood expression</strong>
        </a>
        <strong> for this dimension. By default it is </strong>
        <strong>$main.sum($name)</strong>
        <strong> where </strong>
        <strong>
          <em>name</em>
        </strong>
        <strong> is the name of the measure.</strong>
      </p>
      <p>
        <strong>The </strong>
        <strong>$main</strong>
        <strong>
          {" "}
          part of the measure expressions serves as a placeholder for the data
          segment. In Plywood every aggregate is a function that acts on a data
          segment.
        </strong>
      </p>
    </>
  )
}

export default ModelConfigDocs
