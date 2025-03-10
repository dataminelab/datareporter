import React from "react";

import "./ModelConfigDocs.less";

function ModelConfigDocs() {
  return (
    <div className="model-config-docs">
      <h1>
        <strong>Model</strong>
      </h1>
      <span>
        <p>
          Start from creating a model that extracts insights (dimensions and measures) from the data source,
          leading you to the necessary data within your database.
          Below explains how to configuring your models.
          Here are some key points to consider when configuring your models:
          <ul>
            <li>Ensure that the model name is unique and URL-safe.</li>
            <li>Define a clear and descriptive title for each model.</li>
            <li>Select an appropriate time attribute to track changes over time.</li>
            <li>Assign the model to the correct cluster, if applicable.</li>
            <li>Set default sorting and selected measures to enhance user experience.</li>
          </ul>
        </p>
      </span>
      <h2>
        <strong>Overview</strong>
      </h2>
      <p>
        <span>
          The <strong>dataCubes</strong> at the top level holds the data cubes to be loaded into Data Reporter.
          The sequence of data cubes in this configuration determines their order in the user interface.
        </span>
      </p>
      <h3>
        <strong>Core Configuration Properties</strong>
      </h3>
      <p>
        <strong>
        Only the properties that are likely to be adjusted are described below:
        </strong>
      </p>
      <p>
        <strong>• name: </strong>
        <span>
          Defines how Data Reporter identifies your data cube.
          It must be URL-safe and unique.
          Changing it can disrupt existing URLs that depend on this data cube.
        </span>
      </p>
      <p>
        <strong>• title: </strong>
        <span>This is the user-facing name for your data cube.</span>
      </p>
      <p>
        <strong>• timeAttribute: </strong>
        <span>The primary time dimension, such as 'created_date`.</span>
      </p>
      <p>
        <strong>• clusterName: </strong>
        <span>Indicates the cluster to which your data cube belongs, default is `native`.</span>
      </p>
      <p>
        <strong>• defaultSortMeasure: </strong>
        <span>
          The name of the measure that will be used for default sorting in the UI.
          Default is the first measure available.
        </span>
      </p>
      <p>
        <strong>• defaultSelectedMeasures: </strong>
        <span>
          The measures that are selected by default in the UI
        </span>
      </p>
      <h3>
        <strong>Attribute Overrides</strong>
      </h3>
      <p>
        When additional guidance is needed,
        the <strong>attributeOverrides</strong> section allows customization.
        Here, you can specify the attribute (column) name from the data source that may require special handling.
      </p>
      <p>
        <strong>• name: </strong>
        <span>This is the name of the attribute (column) from your data source.</span>
      </p>
      <p>
        <strong>• type: </strong>
        <span>
          Preselected variable that is generated on creation,
          you don't need to change this, 
          changing it without knowing what you do might break the config
        </span>
      </p>
      <p>
        <strong>• nativeType: </strong>
        <span>
          same as type,
          but instead of generate it is directly coming from the datasource's info channel
        </span>
      </p>
      <h2>
        <strong>Dimensions</strong>
      </h2>
      <p>
        <strong>
          Dimensions add context to your data. consider the following attributes when defining them:
        </strong>
      </p>
      <h3>
        <strong>Dimension</strong>
      </h3>
      <p>
      <span style={{ fontWeight: 400 }}>
          In the realm of data, dimensions are crucial as they add context to our numbers. Here's what you need to know about defining them. Dimensions are defined with following attributes:</span>
      </p>
      <p>
        <strong>name</strong>
      </p>
      <p>
        <span style={{ fontWeight: 400 }}>
          A unique identifier for the dimension, which must be URL-safe.
          Although it doesn’t have to match the attribute name, it must be unique across all dimensions, dimension groups, measures, and measure groups.
          Be cautious when renaming, as it may affect existing reports relying on this dimension.
        </span>
      </p>
      <p>
        <strong>title</strong>
      </p>
      <p>
      <span style={{ fontWeight: 400 }}>
        The displayed name for the dimension in the UI.
        You can modify it freely without affecting any functions or existing reports.
      </span>
      </p>
      <p>&nbsp;</p>
      <h2>
        <strong>Measures</strong>
      </h2>
      <p>
        Measures represent quantifiable data or counts. When defining measures, consider the following attributes:
      </p>

      <h3><strong>Measure</strong></h3>
      <p>
        <strong>name</strong>
      </p>
      <p>
        <span style={{ fontWeight: 400 }}>
          A unique, URL-safe identifier for the measure.
          Modifying it later can disrupt URLs that previously included this measure.
        </span>
      </p>
      <p>
        <strong>• title: </strong>
        <span>
        This is the measure's displayed name in the UI.
        It can be changed at any time without affecting data or reports.
        </span>
      </p>
      <p>
        <strong>formula</strong> (string: Plywood expression)<br/>
        This represents the Plywood expression tied to the measure. By default,
        it is set as "$main.sum($name)", where 'name' represents the measure’s identifier.
        "$main" serves as the segment of your data,
        in line with Plywood's approach that treats every aggregate as a function acting on a data segment.
        For a definition of Plywood expressions see
        <a href="https://plywood.imply.io/expressions">Plywood Expressions</a>
      </p>
    </div>
  )
}

export default ModelConfigDocs;
