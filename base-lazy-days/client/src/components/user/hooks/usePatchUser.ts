import jsonpatch from 'fast-json-patch';
import { useMutation } from 'react-query';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { useUser } from './useUser';
import { useCustomToast } from '../../app/hooks/useCustomToast';
import { queryKeys } from '../../../react-query/constants';
import { queryClient } from 'react-query/queryClient';

// for when we need a server function
async function patchUserOnServer(
  newData: User | null,
  originalData: User | null,
): Promise<User | null> {
  if (!newData || !originalData) return null;
  // create a patch for the difference between newData and originalData
  const patch = jsonpatch.compare(originalData, newData);

  // send patched data to the server
  const { data } = await axiosInstance.patch(
    `/user/${originalData.id}`,
    { patch },
    {
      headers: getJWTHeader(originalData),
    },
  );
  return data.user;
}

// TODO: update type to UseMutateFunction type
export function usePatchUser(): (newData: User | null) => void {
  const { user, updateUser } = useUser();
  const toast = useCustomToast();

  // TODO: replace with mutate function
  const { mutate: patchUser } = useMutation(
    (newUserData: User) => patchUserOnServer(newUserData, user),
    {
      onMutate: async (newData: User | null) => {
        queryClient.cancelQueries(queryKeys.user);

        const previousUserData: User = queryClient.getQueryData(queryKeys.user);

        updateUser(newData);

        return { previousUserData };
      },
      onError: (error, newData, previousUserDataContext) => {
        if (previousUserDataContext.previousUserData) {
          updateUser(previousUserDataContext.previousUserData);
          toast({
            title: 'Updated Failed',
            status: 'warning',
          });
        }
      },
      onSuccess: (userData: User | null) => {
        if (user) updateUser(userData);
        toast({ title: 'Successfully Updated', status: 'success' });
      },
      onSettled: () => {
        queryClient.invalidateQueries(queryKeys.user);
      },
    },
  );

  return patchUser;
}
