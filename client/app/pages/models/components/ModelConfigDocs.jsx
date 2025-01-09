import React from "react";

function ModelConfigDocs() {
  return (
    <>
      <h1><strong>Model</strong></h1>
      <span style={{ fontWeight: 400 }}>
        Start from creating a model that extracts insights (dimensions and measures) from the data source, leading you to the necessary data within your database.
      </span>
      <h1><strong>Configuring Your Model</strong></h1>
      <h2><strong>Overview</strong></h2>
      <p>
        The <strong>dataCubes</strong> at the top level holds the data cubes to be loaded into Data Reporter. The sequence of data cubes in this configuration determines their order in the user interface.
      </p>
      <h2><strong>Core Configuration Properties</strong></h2>
      <p>Only the properties that are likely to be adjusted are described below:</p>

      <p><strong>name</strong></p>
      <p>Defines how Data Reporter identifies your data cube. This must be URL-safe; changing it can disrupt existing URLs that depend on this data cube.</p>

      <p><strong>title</strong></p>
      <p>This is the user-facing name for your data cube.</p>

      <p><strong>timeAttribute</strong></p>
      <p>The primary time dimension, such as 'created_date'.</p>

      <p><strong>clusterName</strong></p>
      <p>Indicates the cluster to which your data cube belongs (default: native).</p>

      <p><strong>defaultSortMeasure</strong> (default: the first measure)</p>
      <p>The name of the measure used as the default sorting option.</p>

      <p><strong>defaultSelectedMeasures</strong> (default: first four measures)</p>
      <p>The measures that are selected by default in the UI.</p>

      <h2><strong>Attribute Overrides</strong></h2>
      <p>
        When additional guidance is needed, the <strong>attributeOverrides</strong> section allows customization. Here, you can specify the attribute (column) name from the data source that may require special handling.
      </p>

      <p><strong>name</strong></p>
      <p>This is the name of the attribute (column) from your data source.</p>

      <h2><strong>Dimensions</strong></h2>
      <p>
        Dimensions add context to your data. When defining dimensions, consider the following attributes:
      </p>

      <h3><strong>Dimension</strong></h3>
      <p>
        <strong>name</strong><br/>
        A unique identifier for the dimension, which must be URL-safe. Although it doesn’t have to match the attribute name, it must be unique across all dimensions, dimension groups, measures, and measure groups. Be cautious when renaming, as it may affect existing reports relying on this dimension.
      </p>

      <p>
        <strong>title</strong><br/>
        The displayed name for the dimension in the UI. You can modify it freely without affecting any functions or existing reports.
      </p>

      <h2><strong>Measures</strong></h2>
      <p>
        Measures represent quantifiable data or counts. When defining measures, consider the following attributes:
      </p>

      <h3><strong>Measure</strong></h3>
      <p>
        <strong>name</strong><br/>
        A unique, URL-safe identifier for the measure. Modifying it later can disrupt URLs that previously included this measure.
      </p>

      <p>
        <strong>title</strong><br/>
        This is the measure's displayed name in the UI and can be changed at any time without affecting data or reports.
      </p>

      <p>
        <strong>formula</strong> (string: Plywood expression)<br/>
        This represents the Plywood expression tied to the measure. By default, it is set as "$main.sum($name)", where 'name' represents the measure’s identifier. "$main" serves as the segment of your data, in line with Plywood's approach that treats every aggregate as a function acting on a data segment.
        For a definition of Plywood expressions see <a href="https://plywood.imply.io/expressions">Plywood Expressions</a>
      </p>
    </>
  );
}

export default ModelConfigDocs; 