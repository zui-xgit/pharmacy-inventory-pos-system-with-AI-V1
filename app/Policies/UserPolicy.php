<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{


    /**
     * Determine if the actor can change the target user's status
     * (activate, deactivate, suspend).
     *    
     */

    
    public function changeStatus(User $user, User $model): Response
    {
        return $user->uuid !== $model->uuid
            ? Response::allow()
            : Response::deny('You cannot change your own status.');
    }

    public function updateCredentials(User $user, User $model): Response
    {
        return $user->uuid !== $model->uuid
            ? Response::allow() 
            : Response::deny('FORBIDDEN');
    }

    public function updateStaff(User $user, User $model): Response
    {
        return $user->uuid !== $model->uuid
            ? Response::allow() 
            : Response::deny('FORBIDDEN');
    }

    


    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, User $model): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, User $model): bool
    {
        return false;
    }
}
