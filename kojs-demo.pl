#!/usr/bin/env perl
use Mojolicious::Lite;

plugin 'PODRenderer';

get '/mail' => sub {
    my $c = shift;
    my $f = $c->param('folder');
    my $m = $c->param('mailId');

    my $mailUrl = 'http://learn.knockoutjs.com/mail';
    my $json = $c->app->ua->get(
        $mailUrl => 'form',
        { folder => $f, mailId => $m },
    )->res->json;

    $c->render( json => $json );
};

get '/' => sub { shift->redirect_to('/hello.html' ) };

app->start;
