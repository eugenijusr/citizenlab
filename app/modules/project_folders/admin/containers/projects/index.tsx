import React, { Component } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'react-router';

// services
import { PublicationStatus } from 'services/projects';
import { updateProjectFolderMembership } from 'modules/project_folders/services/projects';
import { isAdmin } from 'services/permissions/roles';

// resources
import GetProjectFolder, {
  GetProjectFolderChildProps,
} from 'modules/project_folders/resources/GetProjectFolder';
import GetAdminPublications, {
  GetAdminPublicationsChildProps,
} from 'resources/GetAdminPublications';
import { GetAuthUserChildProps, withAuthUser } from 'resources/GetAuthUser';

// localisation
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// components
import {
  List,
  Row,
  SortableList,
  SortableRow,
} from 'components/admin/ResourceList';
import { HeaderTitle } from 'containers/Admin/projects/all/StyledComponents';
import ProjectRow from 'containers/Admin/projects/components/ProjectRow';

// style
import styled from 'styled-components';
import { reorderAdminPublication } from 'services/adminPublications';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';

const Container = styled.div`
  min-height: 60vh;
`;

const ListsContainer = styled.div``;

const ListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 25px;

  &:not(:first-child) {
    margin-top: 70px;
  }

  & + & {
    margin-top: 30px;
  }
`;

const StyledHeaderTitle = styled(HeaderTitle)`
  font-weight: bold;
`;

const Spacer = styled.div`
  flex: 1;
`;

interface DataProps {
  topLevelProjects: GetAdminPublicationsChildProps;
  projectFolder: GetProjectFolderChildProps;
  projectsInFolder: GetAdminPublicationsChildProps;
  authUser: GetAuthUserChildProps;
}

interface Props extends DataProps {}

interface State {
  processing: string[];
}

class AdminFoldersProjectsList extends Component<
  Props & WithRouterProps,
  State
> {
  constructor(props) {
    super(props);

    this.state = {
      processing: [],
    };
  }

  get projectFolderId() {
    return !isNilOrError(this.props.projectFolder)
      ? this.props.projectFolder.id
      : undefined;
  }

  handleReorder = (itemId, newOrder) => {
    reorderAdminPublication(itemId, newOrder);
  };

  addProjectToFolder = (projectId: string) => async () => {
    if (this.projectFolderId) {
      this.setState(({ processing }) => ({
        processing: [...processing, projectId],
      }));
      await updateProjectFolderMembership(projectId, this.projectFolderId);
      this.setState(({ processing }) => ({
        processing: processing.filter((item) => item !== projectId),
      }));
    }
  };

  removeProjectFromFolder = (projectId: string) => async () => {
    this.setState(({ processing }) => ({
      processing: [...processing, projectId],
    }));
    await updateProjectFolderMembership(projectId, null, this.projectFolderId);
    this.setState(({ processing }) => ({
      processing: processing.filter((item) => item !== projectId),
    }));
  };

  ProjectListRowComponent = (rowProps) => {
    const { authUser } = this.props;
    return authUser && isAdmin({ data: authUser }) ? (
      <SortableRow {...rowProps} />
    ) : (
      <Row {...rowProps} />
    );
  };

  render() {
    const { projectFolderId } = this;
    const { topLevelProjects, projectsInFolder, authUser } = this.props;

    const { processing } = this.state;
    const userIsAdmin = authUser && isAdmin({ data: authUser });

    const otherProjects =
      !isNilOrError(topLevelProjects) && topLevelProjects.list
        ? topLevelProjects.list.filter(
            (item) => item.publicationType === 'project'
          )
        : null;

    const inFolderFinalList =
      !isNilOrError(projectsInFolder) &&
      projectsInFolder.list &&
      projectsInFolder.list.length > 0
        ? projectsInFolder.list.filter(
            (item) => item.publicationType === 'project'
          )
        : null;

    return projectFolderId ? (
      <Container>
        <ListsContainer>
          <ListHeader>
            <StyledHeaderTitle>
              <FormattedMessage {...messages.projectsAlreadyAdded} />
            </StyledHeaderTitle>

            <Spacer />
          </ListHeader>

          {inFolderFinalList ? (
            <SortableList
              key={`IN_FOLDER_LIST${inFolderFinalList.length}`}
              items={inFolderFinalList}
              onReorder={this.handleReorder}
              className="projects-list e2e-admin-folder-projects-list"
              id="e2e-admin-fodlers-projects-list"
            >
              {({ itemsList, handleDragRow, handleDropRow }) => (
                <>
                  {itemsList.map(
                    (adminPublication: IAdminPublicationContent, index) => {
                      return (
                        <this.ProjectListRowComponent
                          key={adminPublication.id}
                          id={adminPublication.id}
                          index={index}
                          moveRow={handleDragRow}
                          dropRow={handleDropRow}
                          lastItem={index === itemsList.length - 1}
                        >
                          <ProjectRow
                            publication={adminPublication}
                            actions={
                              userIsAdmin
                                ? [
                                    {
                                      buttonContent: (
                                        <FormattedMessage
                                          {...messages.removeFromFolder}
                                        />
                                      ),
                                      handler: this.removeProjectFromFolder,
                                      icon: 'remove',
                                      processing: processing.includes(
                                        adminPublication.publicationId
                                      ),
                                    },
                                    'manage',
                                  ]
                                : ['manage']
                            }
                          />
                        </this.ProjectListRowComponent>
                      );
                    }
                  )}
                </>
              )}
            </SortableList>
          ) : (
            <FormattedMessage {...messages.emptyFolder} />
          )}

          {userIsAdmin && (
            <>
              <ListHeader>
                <StyledHeaderTitle>
                  <FormattedMessage {...messages.projectsYouCanAdd} />
                </StyledHeaderTitle>
              </ListHeader>

              {otherProjects ? (
                <List key={`JUST_LIST${otherProjects.length}`}>
                  {otherProjects.map((adminPublication, index: number) => {
                    return (
                      <Row
                        id={adminPublication.id}
                        isLastItem={index === otherProjects.length - 1}
                        key={adminPublication.id}
                      >
                        <ProjectRow
                          publication={adminPublication}
                          actions={[
                            {
                              buttonContent: (
                                <FormattedMessage {...messages.addToFolder} />
                              ),
                              handler: this.addProjectToFolder,
                              processing: processing.includes(
                                adminPublication.publicationId
                              ),
                              icon: 'plus-circle',
                            },
                          ]}
                        />
                      </Row>
                    );
                  })}
                </List>
              ) : (
                <FormattedMessage {...messages.noProjectsToAdd} />
              )}
            </>
          )}
        </ListsContainer>
      </Container>
    ) : null;
  }
}
const AdminFoldersProjectsListWithHocs = withAuthUser(
  withRouter(AdminFoldersProjectsList)
);

const publicationStatuses: PublicationStatus[] = [
  'draft',
  'archived',
  'published',
];

const Data = adopt<DataProps, WithRouterProps>({
  projectFolder: ({ params, render }) => (
    <GetProjectFolder projectFolderId={params.projectFolderId}>
      {render}
    </GetProjectFolder>
  ),
  topLevelProjects: (
    <GetAdminPublications
      publicationStatusFilter={publicationStatuses}
      folderId={null}
    />
  ),
  projectsInFolder: ({ params, render }) => (
    <GetAdminPublications
      publicationStatusFilter={publicationStatuses}
      folderId={params.projectFolderId}
    >
      {render}
    </GetAdminPublications>
  ),
});

export default (inputProps: WithRouterProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <AdminFoldersProjectsListWithHocs {...inputProps} {...dataProps} />
    )}
  </Data>
);
