import React from "react";


function ModelConfigDocs() {

  return (<>
      <h1>
        <strong>Model&nbsp;</strong>
      </h1>
    <span style={{ fontWeight: 400 }}>
    Start your journey by embarking on the creation of your very own model, an essential feature that captures critical details from your data source. Think of this model as your roadmap, guiding you to the data you need from your database.
    <p></p>
    </span>
      <h1>
        <strong>Configuring Your Model</strong>
      </h1>
      <h2>
        <strong>Overview</strong>
      </h2>
      <p>
        <span style={{ fontWeight: 400 }}>The top level </span>
        <span style={{ fontWeight: 400 }}>dataCubes:</span>
        <span style={{ fontWeight: 400 }}>
      {" "}
          key that holds the data cubes that will be loaded into Data reporter. The
      order of the data cubes in the config will define the ordering seen in the
      UI.
    </span>
      </p>
      <h2>
        <strong>Let's dive into some basic properties you can adjust:</strong>
      </h2>
      <p>
    <span style={{ fontWeight: 400 }}>
      Described here are only the properties which you might want to change.
    </span>
      </p>
      <p>
        <strong>name</strong>
      </p>
      <p>
      <span style={{ fontWeight: 400 }}>
        How Data reporter recognizes your data cube. It's URL safe, but remember, any changes to this will disrupt any previously generated URLs tied to your data cube.
        </span>
      </p>
      <p>
        <strong>title</strong>
      </p>
      <p>
        <strong>
        This will be the public-facing name for your data cube.
        </strong>
      </p>
      <p>
        <strong>&nbsp;timeAttribute</strong>
      </p>
      <p>
      <span style={{ fontWeight: 400 }}>
        A selected time dimension, for example, 'created_date'.
        </span>
      </p>
      <p>
        <strong>clusterName</strong>
      </p>
      <p>
      <span style={{ fontWeight: 400 }}>
        Denotes which cluster your data cube belongs to (default: native)
        </span>
      </p>
      <p>
        <strong>defaultSortMeasure</strong>
        <strong>default: the first measure</strong>
      </p>
      <p>
      <span style={{ fontWeight: 400 }}>
        The name of the measure that will be used for default sorting.
        </span>
      </p>
      <p>
        <strong>defaultSelectedMeasures</strong>
        <strong> default: first four measures</strong>
      </p>
      <p>
      <span style={{ fontWeight: 400 }}>
          The names of the measures that will be selected by default.
          </span>
      </p>
      <h2>
        <strong>Attribute Overrides</strong>
      </h2>
      <p>
        <strong>
        There might be instances where additional guidance is required for the Data reporter. The attributeOverrides: section allows for such intervention, where you can input the name of the attribute (column) from the data source.
        </strong>
      </p>
      <p>
        <strong>name</strong>
      </p>
      <p>
      <span style={{ fontWeight: 400 }}>
          The name of the attribute (column) from data source.&nbsp;
      </span>
      </p>
      <p>
      <span style={{ fontWeight: 400 }}>
          Here are some common scenarios where you should add an attribute override:
        </span>
      </p>
      <h2>
        <strong>Dimensions</strong>
      </h2>
      <p>
        <strong>
        In the realm of data, dimensions are crucial as they add context to our numbers. Here's what you need to know about defining them:
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
        Every dimension has a unique identifier that's URL safe. This name doesn't have to match the attribute name, but it does need to be unique across all dimensions, dimension groups, measures, and measure groups. Do bear in mind that if you alter this name, any pre-existing reports featuring this dimension may be disrupted.
        </span>
      </p>
      <p>
        <strong>title</strong>
      </p>
      <p>
      <span style={{ fontWeight: 400 }}>
        This refers to the displayed name for the dimension in the UI. Feel free to set this to anything you like; it's completely safe to alter at any time and won't impact any underlying functions or pre-existing reports.
        </span>
      </p>
      <p>&nbsp;</p>
      <h2>
        <strong>Measures</strong>
      </h2>
      <p>
      <span style={{ fontWeight: 400 }}>
          Measures, on the other hand, represent the actual quantities or counts in our data. When defining your measures, here are the elements you need to consider:
        </span>
      </p>
      <h3>
        <strong>Measure</strong>
      </h3>
      <p>
      <span style={{ fontWeight: 400 }}>
          Measures are defined with following attributes:
        </span>
      </p>
      <p>
        <strong>name</strong>
      </p>
      <p>
      <span style={{ fontWeight: 400 }}>
        Each measure requires a unique, URL-safe name. Similar to dimensions, changing this identifier can potentially disrupt any URLs that previously included this measure.
        </span>
      </p>
      <p>
        <strong>title</strong>
      </p>
      <p>
      <span style={{ fontWeight: 400 }}>
        This is the displayed name for the measure in the UI. It can be modified at any time without any repercussions to your data or reports.
        </span>
      </p>
      <p>
        <strong>formula</strong>
        <strong> (string: plywood expression)</strong>
      </p>
      <p>
      <span style={{ fontWeight: 400 }}>
          This is the specific Plywood expression associated with your measure. By default, it's set to $main.sum($name), where 'name' stands for the measure's name. In this formula, $main acts as a placeholder for your data segment, keeping in line with Plywood's principle that every aggregate is a function acting on a data segment.
        </span>
      </p>
    </>
  )
}

export default ModelConfigDocs
