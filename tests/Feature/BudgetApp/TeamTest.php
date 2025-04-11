<?php

namespace Tests\Feature;

use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeamTest extends TestCase
{
    use RefreshDatabase;

    protected $user, $team;

    protected function setUp(): void
    {
        parent::setUp();
        // Create a team
        $this->team = Team::factory()->create();

        // Create and assign a user to the team
        $this->user = User::factory()->create([
            'team_id' => $this->team->id, // Assign the team
        ]);

        $this->actingAs($this->user);

        $this->get('/login');
    }

    public function test_team_can_be_stored_via_route()
    {
        $payload = [
            '_token' => session()->token(),
            'name' => 'New Team',
        ];

        $response = $this->post(route('teams.store'), $payload);
        $response->assertStatus(302);
        $response->assertSessionHas('success', 'Team created successfully'); // Ensure success message


        $this->assertDatabaseHas('teams', ['name' => 'New Team']);
    }

    public function test_team_can_be_updated_via_route()
    {

        $payload = [
            '_token' => session()->token(),
            'name' => 'Updated Team Name',
            'owner_id' => $this->user->id,
        ];

        $response = $this->patch(route('teams.update', $this->team), $payload);
        $response->assertStatus(302);

        $this->team->refresh();
        $this->assertEquals($this->user->id, $this->team->owner_id);
        $this->assertEquals('Updated Team Name', $this->team->name);
    }

    public function test_team_can_be_deleted_via_route()
    {
        $response = $this->delete(route('teams.destroy', $this->team),
            [
                '_token' => session()->token(),
            ]
        );
        $response->assertStatus(302);

        $this->assertDatabaseMissing('teams', ['id' => $this->team->id]);
    }
}
