import { captureException } from "@sentry/react";
import fetchProtectedBranchesRequest from "git/requests/fetchProtectedBranchesRequest";
import type { FetchProtectedBranchesResponse } from "git/requests/fetchProtectedBranchesRequest.types";
import { gitArtifactActions } from "git/store/gitArtifactSlice";
import type { GitArtifactPayloadAction } from "git/store/types";
import log from "loglevel";
import { call, put } from "redux-saga/effects";
import { validateResponse } from "sagas/ErrorSagas";

export default function* fetchProtectedBranchesSaga(
  action: GitArtifactPayloadAction,
) {
  const { artifactType, baseArtifactId } = action.payload;
  const basePayload = { artifactType, baseArtifactId };
  let response: FetchProtectedBranchesResponse | undefined;

  try {
    response = yield call(fetchProtectedBranchesRequest, baseArtifactId);

    const isValidResponse: boolean = yield validateResponse(response);

    if (response && isValidResponse) {
      yield put(
        gitArtifactActions.fetchProtectedBranchesSuccess({
          ...basePayload,
          responseData: response.data,
        }),
      );
    }
  } catch (e) {
    if (response && response.responseMeta.error) {
      const { error } = response.responseMeta;

      yield put(
        gitArtifactActions.fetchProtectedBranchesError({
          ...basePayload,
          error,
        }),
      );
    } else {
      log.error(e);
      captureException(e);
    }
  }
}
