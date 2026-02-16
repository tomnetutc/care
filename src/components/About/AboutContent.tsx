import React from 'react';
import ibatur from '../../images/HeadShots/ibatur.jpg';
import mohammed from '../../images/HeadShots/mohammed.jpg';
import cchen from '../../images/HeadShots/cchen.jpeg';
import rpendyala from '../../images/HeadShots/rpendyala.png';
import spolzin from '../../images/HeadShots/spolzin.png';
import xuesongzhou from '../../images/HeadShots/xuesongzhou.png';
import norahennessy from '../../images/HeadShots/norahennessy.png';
import './AboutContent.scss';

export const AboutContent: React.FC = () => {
  return (
    <div 
      className="about-content-wrapper"
      style={{
        marginLeft: '250px',
        width: 'calc(100% - 250px)',
        paddingLeft: '40px',
        paddingRight: '60px',
        paddingTop: '40px',
        paddingBottom: '60px',
        boxSizing: 'border-box',
        display: 'block',
        position: 'relative'
      }}
    >
      <section style={{ textAlign: "justify" }}>
          <h3 id="section1" className="mt-4 fw-bold contenthead">
            About
          </h3>
          <p className="mt-4">
          The Community Adaptation and Resilience to Extremes (CARE) Dashboard is an open-source platform designed to provide insights into how individuals and communities adapt to extreme events such as extreme weather events, pandemics, and power outages. The project was sponsored through the National Science Foundation's Leading Engineering for America's Prosperity, Health, and Infrastructure (LEAP HI) program, specifically under the project "<a href="https://www.adaptable-cities.org/" target="_blank" rel="noopener noreferrer">LEAP-HI: Adaptable Cities</a>" (Federal Award ID: 2053373). The CARE Dashboard is also sponsored by <a href="https://tbd.ctr.utexas.edu/" target="_blank" rel="noopener noreferrer">The National Center for Understanding Future Travel Behavior and Demand (TBD)</a>, a University Transportation Center funded by the U.S. Department of Transportation. The dashboard is designed to be housed within the Center's Travel Behavior Data (TBD) Hub, which is a comprehensive travel behavior data hub that brings a variety of dashboards into a single unified platform, providing a one-stop shop for data-driven insights on travel behavior and demand.
          </p>
          <p className="mt-4">
          Developed primarily by the TOMNET Transportation Center group at Arizona State University, the CARE Dashboard leverages data from the nationwide CARE survey, which collected responses from approximately 5,100 individuals across the United States, including targeted oversamples from the Seattle and Phoenix metropolitan areas. The platform provides researchers, practitioners, and policymakers with tools to explore how people adapt their activity-travel behaviors in response to disruptive events such as extreme weather, pandemics, and power outages.
          </p>
        </section>
        <section style={{ textAlign: "justify" }}>
          <h3 id="section2" className="mt-4 fw-bold contenthead">
            Dashboard Components
          </h3>
          <p className="mt-4 mb-4">
            The CARE Dashboard features two complementary analysis tools:
          </p>
          <div className="about-highlight-box">
            <p><strong>1. Survey Data Explorer:</strong> An interactive platform that enables users to explore the nationwide CARE survey dataset through thoughtfully designed visualizations and analytical tools. Users can navigate through survey sections including Lifestyle & Wellbeing, Community Resources & Preparedness, Experiences and Responses to Disruptions, Activity and Travel Behaviors, and Sample Characteristics. The tool offers customizable filters, instant descriptive statistics, and downloadable data/results.</p>
          </div>
          <div className="about-highlight-box">
            <p><strong>2. Scenario Analysis Tool:</strong> This component leverages the concept of Average Treatment Effects (ATEs) to generate predictions of how individuals might adjust their activity-travel behaviors under five specific extreme event scenarios: Extreme Heat, Extreme Cold, Major Flooding, Major Earthquake, and Power Outage. The ATEs are computed based on approximately 50 econometric models that are estimated by the research team using the CARE dataset. The models examine 9 different activity/travel choice dimensions and incorporate factors such as prior experience with extreme events, severity levels, socio-demographic characteristics, personality traits, and community resources. The tool allows users to explore how behavioral adaptations vary across different population groups and event contexts, supporting data-driven planning and policy applications.</p>
          </div>
        </section>
        <section style={{ textAlign: "justify" }}>
          <h3 id="section3" className="mt-4 fw-bold contenthead">
            Data source
          </h3>
          <p className="mt-4">
          The CARE survey was conducted from August 2024 through February 2025 and collected comprehensive information from respondents across the United States to learn how they experience and respond to extreme events. The survey sample consisted of adults residing in the United States, with oversampling in the Greater Phoenix metropolitan region (Maricopa County) of Arizona and the Greater Seattle area (Puget Sound region) in the State of Washington. The survey gathered detailed socio-economic and demographic data, information about attitudes, perceptions, values, preferences, and choices, and detailed information about past experiences with extreme events and how respondents plan to adapt to future extreme events in the event they were to happen again. The survey was administered to a commercial online panel through the Qualtrics survey platform. A total of 5,082 responses were obtained, including 1,047 from Maricopa County, 1,000 from the Greater Seattle region, and the remaining 3,000+ responses from around the nation.
          </p>
          <p className="mt-4">
          The survey includes detailed questions across six sections:
          </p>
          <ul style={{ listStyleType: 'disc'}}>
          <li className="mt-2">Lifestyle preferences and life satisfaction</li>
          <li className="mt-2">Access to community resources and preparedness</li>
          <li className="mt-2">Prior experiences with various extreme events</li>
          <li className="mt-2">Coping strategies and anticipated behavioral responses</li>
          <li className="mt-2">Current activity-travel patterns and behaviors</li>
          <li className="mt-2">Socio-demographic and household characteristics</li>
          </ul>
          <p className="mt-4">
          The survey was designed to understand not only how people have adapted to past extreme events, but also how they anticipate adapting their behaviors during future disruptions. The survey included a question asking respondents if and when they had last experienced different types of extreme events. A random subset of those who reported ever having experienced five different extreme events was then asked a series of follow-up questions about the impact of these events on their lives, their ability to cope with the effects of the extreme event, anticipated future impacts, and expectations of how they believe they will behave and adjust their activity-travel patterns if the event were to happen again.
          </p>
          <p className="mt-4">
          The number of respondents who completed these specialized modules for each of the five extreme events are as follows:
          </p>
          <ul style={{ listStyleType: 'disc'}}>
          <li className="mt-2">Extreme heat (significantly above normal temperatures for your area): 2,650</li>
          <li className="mt-2">Extreme cold (significantly below normal temperatures for your area): 2,430</li>
          <li className="mt-2">Major flooding: 1,076</li>
          <li className="mt-2">Major earthquake (magnitude 6.0 or greater): 610</li>
          <li className="mt-2">Neighborhood-wide power outage (not related to unpaid bills): 2,379</li>
          </ul>
          <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#6dafa0', fontSize: '1.3rem', fontFamily: "'Roboto', sans-serif", fontWeight: 600 }}>Data Dictionary and Documentation</h3>
          <p>
            Comprehensive documentation of all survey variables is available in the data dictionary linked below as well as in the Survey Explorer page of the dashboard, which includes variable names, descriptions, coding schemes, response categories, and summary statistics. In addition, the complete survey instrument, including question wording, skip logic, and survey flow, is also available for researchers who wish to understand the full survey design.
          </p>
          <p style={{ marginLeft: '1.5rem', marginTop: '1rem' }}>
            <a href="#data-dictionary">Download Data Dictionary</a>
          </p>
          <p style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
            <a href="#survey-instrument">Download Survey Instrument</a>
          </p>
        </section>
        <section style={{ textAlign: "justify" }}>
          <h3 id="section4" className="mt-4 fw-bold contenthead">
            Model Estimation and Methodology
          </h3>
          <p className="mt-4 mb-4">
          The Scenario Analysis Tool is built on a comprehensive econometric modeling framework that estimates how individuals adjust their activity-travel behaviors in response to extreme events. The modeling effort represents a substantial analytical undertaking that provides the foundation for the scenario-based predictions available in the dashboard.
          </p>
          <p className="mt-4 mb-4">
          The team estimated approximately 50 econometric models that span 9 different activity/travel choice dimensions across 5 extreme event types (Extreme Heat, Extreme Cold, Major Flooding, Major Earthquake, and Power Outage). This comprehensive modeling approach allows us to understand how different types of extreme events influence various aspects of people's daily travel and activity participation patterns.
          </p>
          <p className="mt-4 mb-4">
          In addition to the behavioral choice models, the team conducted factor analysis to derive latent constructs that capture individual personality traits, environmental attitudes, and measures of community connectedness. These psychological and social factors help explain variation in how people respond to extreme events beyond what can be explained by demographic characteristics alone.
          </p>
          <p className="mt-4 mb-4">
          The models employ an Average Treatment Effects (ATE) methodology to quantify how prior experience with extreme events influences anticipated future behavioral responses. This approach allows us to isolate the effect of past experience while controlling for other individual and contextual factors that may influence behavior.
          </p>
          <p className="mt-4 mb-4">
          To facilitate ease of comparison and interpretation across different event types, the severity level variable was categorized consistently across all extreme events. This design choice enables researchers and practitioners to compare how the same individual might respond differently to various types of extreme events at comparable severity levels, providing valuable insights for resilience planning and emergency management.
          </p>
          
          <div className="about-highlight-box">
            <p><strong>Activity/Travel Choices Modeled:</strong></p>
            <p style={{ marginTop: '0.5rem' }}>The models predict adjustments across nine dimensions of daily activity-travel behavior:</p>
            <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
              <li>Using a car for traveling</li>
              <li>Taking public transit</li>
              <li>Staying at home</li>
              <li>Having food delivered from a restaurant</li>
              <li>Picking up takeout from a restaurant</li>
              <li>Eating indoors at a restaurant</li>
              <li>Working from home</li>
              <li>Working from the office</li>
              <li>Go about business as usual</li>
            </ul>
            <p style={{ marginTop: '0.5rem' }}>Each model accounts for the complex interplay between individual characteristics, prior experience, event severity, and community resources in shaping behavioral responses.</p>
          </div>

          <p style={{ marginTop: '1.5rem' }}>
            <strong>Model Estimation Results:</strong> For detailed information about model specifications, estimation results, goodness-of-fit measures, and interpretation of findings, please refer to the comprehensive model documentation:
          </p>
          <p style={{ marginLeft: '1.5rem' }}>
            📄 <a href="#model-results-pdf">Download Model Estimation Results (PDF)</a>
          </p>
        </section>
        <section style={{ textAlign: "justify" }}>
          <h3 id="section5" className="mt-4 fw-bold contenthead">
            Team
          </h3>
          <div className="row text-center">
            <div className="col">
              <a href="https://search.asu.edu/profile/3243599" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                <figure className="figure">
                  <img src={ibatur} className="figure-img img-fluid rounded-circle" alt="Irfan Batur, PhD" style={{ width: '150px', height: '150px' }} />
                  <figcaption className="figure-caption" style={{ fontWeight: 'bold' }}>Irfan Batur, PhD</figcaption>
                  <figcaption className="figure-caption">Principal Investigator</figcaption>
                  <figcaption className="figure-caption" style={{ fontStyle: 'italic' }} >Arizona State University</figcaption>
                </figure>
              </a>
            </div>
            <div className="col">
              <a href="https://www.linkedin.com/in/mohammedzaid1609/" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                <figure className="figure">
                  <img src={mohammed} className="figure-img img-fluid rounded-circle" alt="Mohammed Zaid" style={{ width: '150px', height: '150px' }} />
                  <figcaption className="figure-caption" style={{ fontWeight: 'bold' }}>Mohammed Zaid</figcaption>
                  <figcaption className="figure-caption">Developer</figcaption>
                  <figcaption className="figure-caption" style={{ fontStyle: 'italic' }} >Arizona State University</figcaption>
                </figure>
              </a>
            </div>
            <div className="col">
              <a href="https://www.ce.washington.edu/facultyfinder/cynthia-chen" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                <figure className="figure">
                  <img src={cchen} className="figure-img img-fluid rounded-circle" alt="Cynthia Chen, PhD" style={{ width: '150px', height: '150px' }} />
                  <figcaption className="figure-caption" style={{ fontWeight: 'bold' }}>Cynthia Chen, PhD</figcaption>
                  <figcaption className="figure-caption">Chief Executive Officer</figcaption>
                  <figcaption className="figure-caption" style={{ fontStyle: 'italic' }} >University of Washington</figcaption>
                </figure>
              </a>
            </div>
            <div className="col">
              <a href="https://search.asu.edu/profile/980477" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                <figure className="figure">
                  <img src={rpendyala} className="figure-img img-fluid rounded-circle" alt="Ram M. Pendyala, PhD" style={{ width: '150px', height: '150px' }} />
                  <figcaption className="figure-caption" style={{ fontWeight: 'bold' }}>Ram M. Pendyala, PhD</figcaption>
                  <figcaption className="figure-caption">Chief Science Officer</figcaption>
                  <figcaption className="figure-caption" style={{ fontStyle: 'italic' }} >Arizona State University</figcaption>
                </figure>
              </a>
            </div>
            <div className="col">
              <a href="https://search.asu.edu/profile/3993044" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                <figure className="figure">
                  <img src={spolzin} className="figure-img img-fluid rounded-circle" alt="Steven E. Polzin, PhD" style={{ width: '150px', height: '150px' }} />
                  <figcaption className="figure-caption" style={{ fontWeight: 'bold' }}>Steven E. Polzin, PhD</figcaption>
                  <figcaption className="figure-caption">Senior Adviser</figcaption>
                  <figcaption className="figure-caption" style={{ fontStyle: 'italic' }} >Arizona State University</figcaption>
                </figure>
              </a>
            </div>
            <div className="col">
              <a href="https://search.asu.edu/profile/2182101" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                <figure className="figure">
                  <img src={xuesongzhou} className="figure-img img-fluid rounded-circle" alt="Xuesong Zhou, PhD" style={{ width: '150px', height: '150px' }} />
                  <figcaption className="figure-caption" style={{ fontWeight: 'bold' }}>Xuesong Zhou, PhD</figcaption>
                  <figcaption className="figure-caption">Co-Principal Investigator</figcaption>
                  <figcaption className="figure-caption" style={{ fontStyle: 'italic' }} >Arizona State University</figcaption>
                </figure>
              </a>
            </div>
            <div className="col">
              <a href="https://search.asu.edu/profile/1683643" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                <figure className="figure">
                  <img src={norahennessy} className="figure-img img-fluid rounded-circle" alt="Nora Hennessy" style={{ width: '150px', height: '150px' }} />
                  <figcaption className="figure-caption" style={{ fontWeight: 'bold' }}>Nora Hennessy</figcaption>
                  <figcaption className="figure-caption">Research Scientist</figcaption>
                  <figcaption className="figure-caption" style={{ fontStyle: 'italic' }} >Arizona State University</figcaption>
                </figure>
              </a>
            </div>
            <div className="col">
              <figure className="figure">
                <div style={{ width: '150px', height: '150px', borderRadius: '50%', backgroundColor: '#e8f3f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: '#6dafa0', fontSize: '3rem', fontWeight: 'bold' }}>TBD</div>
                <figcaption className="figure-caption" style={{ fontWeight: 'bold' }}>To Be Determined</figcaption>
                <figcaption className="figure-caption" style={{ color: '#999' }}>Coming Soon</figcaption>
                <figcaption className="figure-caption" style={{ fontStyle: 'italic', color: '#999' }}>TBD</figcaption>
              </figure>
            </div>
          </div>
        </section>
        <section style={{ textAlign: "justify" }}>
          <h3 id="section6" className="mt-4 fw-bold contenthead">
            Acknowledgments
          </h3>
          
          <div className="about-ack-section">
            <h3>Data Collection Team</h3>
            <p>
              The CARE survey data collection effort was led by a dedicated team of researchers who designed the survey instrument, coordinated the nationwide data collection, and ensured data quality and representativeness.
            </p>
            <p style={{ marginTop: '1rem', color: '#555', lineHeight: '1.8' }}>
              <strong>Team Members:</strong><br />
              Ram M. Pendyala, Arizona State University<br />
              Irfan Batur, Arizona State University<br />
              Eleanor Hennessy, Arizona State University<br />
              Steven E. Polzin, Arizona State University<br />
              Mikhail V. Chester, Arizona State University<br />
              Xuesong Zhou, Arizona State University<br />
              Miguel Rodriguez Ocana, Arizona State University<br />
              Fan Yu, Arizona State University<br />
              Cynthia Chen, University of Washington<br />
              Dan Abramson, University of Washington<br />
              Branden Born, University of Washington<br />
              Chaoyue Zhao, University of Washington<br />
              Katie Idziorek, University of North Carolina at Charlotte
            </p>
          </div>

          <div className="about-ack-section">
            <h3>Model Estimation Team</h3>
            <p>
              The econometric models underlying the Scenario Analysis Tool were developed by a skilled team of researchers who conducted rigorous statistical analyses to estimate Average Treatment Effects and predict behavioral responses to extreme events. Their work enables the scenario-based predictions featured in the dashboard.
            </p>
            <p style={{ marginTop: '1rem', color: '#555', lineHeight: '1.8' }}>
              <strong>Team Members:</strong><br />
              Irfan Batur, Arizona State University<br />
              Jinghai Huo, Arizona State University<br />
              Miguel Rodriguez Ocana, Arizona State University<br />
              Fan Yu, Arizona State University<br />
              Victor Ojimaojo Alhassan, Arizona State University<br />
              Roberto Dimas Valle, Arizona State University<br />
              Fawzan Saleh M Alfawzan, Arizona State University
            </p>
          </div>
        </section>
        <section style={{ textAlign: "justify" }}>
          <h3 id="section7" className="mt-4 fw-bold contenthead">
            Citations
          </h3>
          <p className="mt-4">
          <strong>Note:</strong> When using any material from this dashboard, please consider citing the relevant papers listed below.
          </p>
          <div className="about-citation">
            Batur, I., Alhassan, V. O., Chester, M. V., Polzin, S. E., Chen, C., Bhat, C. R., & Pendyala, R. M. (2024). Understanding how extreme heat impacts human activity-mobility and time use patterns. <em>Transportation Research Part D: Transport and Environment</em>, 136, 104431.
          </div>
          <div className="about-citation">
            Yu, F., Batur, I., Haddad, A. J., Hennessy, E. M., Ocana, M. G. R., Chen, C., Zhou, X., Bhat, C. R., & Pendyala, R. M. (2025). A U-Shaped Paradigm: Understanding the Impact of Telecommuting on Public Transit Ridership Before and After the Pandemic. <em>Presented at the 104th Annual Meeting of the Transportation Research Board</em>, Washington, DC, January 5-9, 2025.
          </div>
          <div className="about-citation">
            Huo, J., Batur, I., Robbennolt, D., Yu, F., Rodriguez Ocana, M. G., Hwang, H., Hennessy, E., Chen, C., Polzin, S. E., Zhou, X., Chester, M. V., Bhat, C. R., & Pendyala, R. M. (2025). The role of prior experience in shaping anticipated travel and activity behavior changes in future extreme heat events. <em>Presented at the 2026 Transportation Research Board Annual Meeting</em>.
          </div>
          <div className="about-citation">
            Hennessy, E., Batur, I., Rodriguez Ocana, M. G., Yu, F., Polzin, S. E., Chen, C., Zhou, X., Chester, M. V., & Pendyala, R. M. (2025). Understanding human activity and travel adaptation strategies in response to extreme events. <em>Presented at the 2026 Transportation Research Board Annual Meeting</em>.
          </div>
        </section>
    </div>
  );
};
