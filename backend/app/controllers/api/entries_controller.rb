class Api::EntriesController < Api::BaseController
  def create
    room = current_user.office.rooms.find(params[:room_id])
    entry = room.entries.build(user_id: params[:user_id], office: current_user.office)
    if entry.save
      render json: entry, status: :created
    else
      render json: { errors: entry.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    entry = current_user.office.entries.find(params[:id])
    entry.destroy!
    head :no_content
  end
end
