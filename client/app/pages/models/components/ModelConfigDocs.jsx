import React from "react";

import "./ModelConfigDocs.less";

function ModelConfigDocs() {
  return (
    <>
      <h1>
        <strong>Model</strong>
      </h1>
      <span>
        <p>
          Start your journey by embarking on the creation of your very own model, 
          an essential feature that captures critical details from your data source. 
          Think of this model as your roadmap, guiding you to the data you need from your database.
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
          Data cubes are the key that holds the data cubes that will be loaded into Data reporter. 
          The order of the data cubes in the config will define the ordering seen in the UI.
        </span>
      </p>
      <h3>
        <strong>Data Cube Properties</strong>
      </h3>
      <p>
        <strong>
          This defines the structure and behavior of your data cubes.
          For example, consider the following data cube configuration:
        </strong>
      </p>
      <p>
        <strong>• name: </strong>
        <span>
          How Data reporter recognizes your data cube. 
          It's URL safe, but remember, 
          any changes to this will disrupt any previously generated URLs tied to your data cube.
        </span>
      </p>
      <p>
        <strong>• title: </strong>
        <span>This will be the public-facing name for your data cube.</span>
      </p>
      <p>
        <strong>• timeAttribute: </strong>
        <span>A selected time dimension, for example, 'created_date'.</span>
      </p>
      <p>
        <strong>• clusterName: </strong>
        <span>Denotes which cluster your data cube belongs to, default is `native`.</span>
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
          The names of the measures that will be selected by default.
          Default is the first measure available.
        </span>
      </p>
      <h3>
        <strong>Attributes</strong>
      </h3>
      <p>
        <strong>
          There might be instances where additional guidance is required for the Data reporter.
          The attributeOverrides: section allows for such intervention.
          You can input the name of the attribute (column) from the data source.
        </strong>
      </p>
      <p>
        <strong>• name: </strong>
        <span>The name of the attribute (column) from data source.</span>
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
      <h3>
        <strong>Dimensions</strong>
      </h3>
      <p>
        <strong>
          Dimensions are crucial as they add context to the data using numbers.
          They are used to split data into different categories or groups,
          making it easier to analyze and understand the underlying patterns.
          They help in breaking down the data into smaller, more manageable parts.
        </strong>
      </p>
      <p>
        <strong>• name: </strong>
        <span>
          Every dimension has a unique identifier that's URL safe.
          This name doesn't have to match the attribute name,
          but it does need to be unique across all dimensions,
          dimension groups, measures, and measure groups.
          Do bear in mind that if you alter this name,
          any pre-existing reports featuring this dimension may be disrupted.
        </span>
      </p>
      <p>
        <strong>• title: </strong>
        <span>
          This refers to the displayed name for the dimension in the UI.
          Feel free to set this to anything you like;
          it's completely safe to alter at any time and won't impact any underlying functions or pre-existing reports.
        </span>
      </p>
      <p>
        <strong>• formula: </strong>
        <span>a type of expression to construct unique names and making their calculations, e.g: $name</span>
      </p>
      <h3>
        <strong>Measures</strong>
      </h3>
      <p>
        <strong>
          Measures represents the actual quantities or counts in our data.
          When defining your measures,
          Measures are defined with following attributes:
        </strong>
      </p>
      <p>
        <strong>• name: </strong>
        <span>
          Each measure requires a unique,
          URL-safe name.
          Similar to dimensions,
          changing this identifier can potentially disrupt any URLs that previously included this measure.
        </span>
      </p>
      <p>
        <strong>• title: </strong>
        <span>
          This is the displayed name for the measure in the UI.
          It can be modified at any time without any repercussions to your data or reports.
        </span>
      </p>
      <p>
        <strong>• formula: </strong>
        <span>
          This is the specific Plywood expression associated with your measure.
          By default, it's set to $main.sum($name), where 'name' stands for the measure's name. In this formula,
          $main acts as a placeholder for your data segment,
          keeping in line with Plywood's principle that every aggregate is a function acting on a data segment.
        </span>
      </p>
    </>
  )
}

export default ModelConfigDocs;
